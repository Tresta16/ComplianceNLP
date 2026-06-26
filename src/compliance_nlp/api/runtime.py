"""Runtime state and lifecycle helpers for the serving API."""

from __future__ import annotations

from typing import Any

import torch
from loguru import logger

from compliance_nlp.api.schemas.health import HealthResponse, ReadinessResponse
from compliance_nlp.api.settings import ApiSettings
from compliance_nlp.utils.reproducibility import set_seed


DEFAULT_RANDOM_SEED = 42


class ModelState:
    """保存服务进程内的模型和外部依赖状态。

    这个对象是进程级状态，启动时初始化，关闭时清理。把它集中在 runtime
    模块里，可以避免 route 函数直接管理外部连接。
    """

    extraction_model: Any = None
    gap_model: Any = None
    retriever: Any = None
    kg_engine: Any = None
    is_kg_enabled: bool = False
    is_kg_connected: bool = False
    is_retriever_configured: bool = False
    device: torch.device = torch.device("cpu")


state = ModelState()


def initialize_kg_engine(settings: ApiSettings, model_state: ModelState = state) -> None:
    """按配置初始化 Neo4j 知识图谱查询引擎。

    Args:
        settings: API 运行配置。
        model_state: 需要更新的进程状态对象。

    Raises:
        RuntimeError: 当配置要求 KG 必须可用但连接失败时抛出。
    """

    model_state.is_kg_enabled = settings.enable_kg
    if not model_state.is_kg_enabled:
        logger.info("KG query engine disabled")
        return

    try:
        from compliance_nlp.knowledge_graph.query import KGQueryEngine

        # 启动时主动验证连接，可以让容器健康检查尽早暴露 Neo4j 配置问题。
        model_state.kg_engine = KGQueryEngine(
            neo4j_uri=settings.neo4j_uri,
            neo4j_user=settings.neo4j_user,
            neo4j_password=settings.neo4j_password,
            max_hops=settings.kg_max_hops,
        )
        model_state.kg_engine.driver.verify_connectivity()
        model_state.is_kg_connected = True
        logger.info("Connected to Neo4j KG at {}", settings.neo4j_uri)
    except Exception as error:
        model_state.kg_engine = None
        model_state.is_kg_connected = False
        logger.exception("Failed to initialize KG query engine")

        if settings.require_kg:
            raise RuntimeError("KG query engine is required but unavailable") from error


def initialize_retriever(settings: ApiSettings, model_state: ModelState = state) -> None:
    """按配置初始化混合检索器外壳。

    Args:
        settings: API 运行配置。
        model_state: 需要更新的进程状态对象。

    Raises:
        RuntimeError: 当配置要求 retriever 必须可用但初始化失败时抛出。
    """

    if not settings.enable_retriever:
        logger.info("Hybrid retriever disabled")
        return

    try:
        from compliance_nlp.retrieval.hybrid import HybridRetriever

        # 这里只构造检索器，不强制下载 dense 模型，避免容器启动被模型下载阻塞。
        model_state.retriever = HybridRetriever(
            dense_model_name=settings.dense_model_name,
            top_k=settings.retriever_top_k,
        )
        model_state.is_retriever_configured = True
        logger.info("Hybrid retriever configured with dense model {}", settings.dense_model_name)
    except Exception as error:
        model_state.retriever = None
        model_state.is_retriever_configured = False
        logger.exception("Failed to initialize hybrid retriever")

        if settings.require_retriever:
            raise RuntimeError("Hybrid retriever is required but unavailable") from error


def is_ready(settings: ApiSettings, model_state: ModelState = state) -> bool:
    """判断当前服务是否满足就绪条件。

    Args:
        settings: API 运行配置。
        model_state: 当前进程状态。

    Returns:
        如果所有被要求的依赖均就绪，则返回 True。
    """

    has_required_models = model_state.extraction_model is not None or model_state.gap_model is not None

    if settings.require_models and not has_required_models:
        return False
    if settings.require_kg and not model_state.is_kg_connected:
        return False
    if settings.require_retriever and not model_state.is_retriever_configured:
        return False

    return True


def build_health_response(settings: ApiSettings, model_state: ModelState = state) -> HealthResponse:
    """构建健康检查响应。

    Args:
        settings: API 运行配置。
        model_state: 当前进程状态。

    Returns:
        当前服务健康状态。
    """

    return HealthResponse(
        status="healthy",
        extraction_model_loaded=model_state.extraction_model is not None,
        gap_model_loaded=model_state.gap_model is not None,
        kg_enabled=model_state.is_kg_enabled,
        kg_connected=model_state.is_kg_connected,
        retriever_configured=model_state.is_retriever_configured,
        gpu_available=torch.cuda.is_available(),
        version=settings.version,
    )


def build_readiness_response(settings: ApiSettings, model_state: ModelState = state) -> ReadinessResponse:
    """构建就绪检查响应。

    Args:
        settings: API 运行配置。
        model_state: 当前进程状态。

    Returns:
        当前服务就绪状态。
    """

    return ReadinessResponse(
        status="ready" if is_ready(settings, model_state) else "not_ready",
        extraction_model_loaded=model_state.extraction_model is not None,
        gap_model_loaded=model_state.gap_model is not None,
        kg_connected=model_state.is_kg_connected,
        retriever_configured=model_state.is_retriever_configured,
    )


def start_serving_runtime(settings: ApiSettings, model_state: ModelState = state) -> None:
    """启动 serving 运行时依赖。

    Args:
        settings: API 运行配置。
        model_state: 需要初始化的进程状态对象。

    Raises:
        RuntimeError: 必需依赖无法初始化时抛出。
    """

    logger.info("Starting ComplianceNLP server...")
    set_seed(DEFAULT_RANDOM_SEED, deterministic=False)

    model_state.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info("Using device: {}", model_state.device)

    initialize_kg_engine(settings, model_state)
    initialize_retriever(settings, model_state)

    # 模型加载仍留给后续配置和真实推理接入，本任务只做 API 分层。
    logger.info("Server ready for requests")


def stop_serving_runtime(model_state: ModelState = state) -> None:
    """清理 serving 运行时依赖。

    Args:
        model_state: 需要清理的进程状态对象。
    """

    logger.info("Shutting down server...")
    if model_state.kg_engine is not None:
        model_state.kg_engine.close()
        model_state.kg_engine = None
        model_state.is_kg_connected = False

    model_state.extraction_model = None
    model_state.gap_model = None
    model_state.retriever = None
    model_state.is_retriever_configured = False

    if torch.cuda.is_available():
        torch.cuda.empty_cache()

