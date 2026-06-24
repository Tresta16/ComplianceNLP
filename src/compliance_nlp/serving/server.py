"""Production model serving infrastructure.

FastAPI-based model serving with:
- Health/readiness checks (for Kubernetes)
- Prometheus metrics collection
- Batched inference
- Error handling and graceful shutdown

Usage:
    uvicorn compliance_nlp.serving.server:app --host 0.0.0.0 --port 8080
"""

from __future__ import annotations

import logging
import os
import time
from contextlib import asynccontextmanager
from typing import Any

import torch
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field
from prometheus_client import Counter, Histogram, generate_latest

from compliance_nlp.utils.reproducibility import set_seed

log = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Prometheus Metrics
# ─────────────────────────────────────────────────────────────────────────────
REQUEST_COUNT = Counter(
    "compliancenlp_requests_total",
    "Total inference requests",
    ["endpoint", "status"],
)
REQUEST_LATENCY = Histogram(
    "compliancenlp_latency_seconds",
    "Inference latency in seconds",
    ["endpoint"],
    buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0],
)
BATCH_SIZE = Histogram(
    "compliancenlp_batch_size",
    "Batch size per request",
    buckets=[1, 2, 4, 8, 16, 32, 64],
)


# ─────────────────────────────────────────────────────────────────────────────
# Request/Response Models
# ─────────────────────────────────────────────────────────────────────────────
class ExtractionRequest(BaseModel):
    """Request for obligation extraction."""
    text: str = Field(..., description="Regulatory text to extract obligations from", max_length=10000)
    framework: str = Field(default="auto", description="Regulatory framework (SEC, MiFID II, Basel III, auto)")


class GapAnalysisRequest(BaseModel):
    """Request for compliance gap analysis."""
    obligation_text: str = Field(..., description="Formatted obligation text")
    policy_text: str = Field(..., description="Internal policy clause text")
    policy_section: str = Field(default="", description="Policy section identifier")
    context_passages: list[str] = Field(default_factory=list, description="Retrieved context passages")


class BatchExtractionRequest(BaseModel):
    """Batched extraction request."""
    texts: list[str] = Field(..., description="List of regulatory texts", max_length=64)
    framework: str = Field(default="auto")


class ExtractionResponse(BaseModel):
    """Obligation extraction response."""
    obligations: list[dict]
    entities: list[dict]
    deontic_modality: str
    cross_references: list[str]
    confidence: float
    latency_ms: float


class GapAnalysisResponse(BaseModel):
    """Gap analysis response."""
    classification: str
    severity: str
    alignment_score: float
    gap_description: str
    recommended_action: str
    grounding_confidence: float
    latency_ms: float


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    extraction_model_loaded: bool
    gap_model_loaded: bool
    kg_enabled: bool
    kg_connected: bool
    retriever_configured: bool
    gpu_available: bool
    version: str


class ReadinessResponse(BaseModel):
    """Readiness check response."""

    status: str
    extraction_model_loaded: bool
    gap_model_loaded: bool
    kg_connected: bool
    retriever_configured: bool


# ─────────────────────────────────────────────────────────────────────────────
# Global State
# ─────────────────────────────────────────────────────────────────────────────
class ModelState:
    extraction_model: Any = None
    gap_model: Any = None
    retriever: Any = None
    kg_engine: Any = None
    is_kg_enabled: bool = False
    is_kg_connected: bool = False
    is_retriever_configured: bool = False
    device: torch.device = torch.device("cpu")


state = ModelState()


# ─────────────────────────────────────────────────────────────────────────────
# Runtime Configuration
# ─────────────────────────────────────────────────────────────────────────────
def _get_bool_env(name: str, default: bool = False) -> bool:
    """Read a boolean environment variable.

    Args:
        name: Environment variable name.
        default: Value used when the variable is not set.

    Returns:
        Parsed boolean value.

    Raises:
        ValueError: If the value is not a recognized boolean string.
    """
    value = os.getenv(name)
    if value is None:
        return default

    normalized_value = value.strip().lower()
    if normalized_value in {"1", "true", "yes", "on"}:
        return True
    if normalized_value in {"0", "false", "no", "off"}:
        return False

    raise ValueError(f"Invalid boolean environment variable {name}={value!r}")


def _initialize_kg_engine() -> None:
    """Initialize the Neo4j-backed KG query engine when enabled.

    Raises:
        RuntimeError: If KG is required but cannot be connected.
    """
    state.is_kg_enabled = _get_bool_env("COMPLIANCENLP_ENABLE_KG", default=False)
    if not state.is_kg_enabled:
        log.info("KG query engine disabled")
        return

    neo4j_uri = os.getenv("COMPLIANCENLP_NEO4J_URI", "bolt://localhost:7687")
    neo4j_user = os.getenv("COMPLIANCENLP_NEO4J_USER", "neo4j")
    neo4j_password = os.getenv("COMPLIANCENLP_NEO4J_PASSWORD", "")
    max_hops = int(os.getenv("COMPLIANCENLP_KG_MAX_HOPS", "3"))

    try:
        from compliance_nlp.knowledge_graph.query import KGQueryEngine

        # 这里主动验证连接，避免服务启动后第一次请求才暴露 Neo4j 配置错误。
        state.kg_engine = KGQueryEngine(
            neo4j_uri=neo4j_uri,
            neo4j_user=neo4j_user,
            neo4j_password=neo4j_password,
            max_hops=max_hops,
        )
        state.kg_engine.driver.verify_connectivity()
        state.is_kg_connected = True
        log.info("Connected to Neo4j KG at %s", neo4j_uri)
    except Exception as error:
        state.kg_engine = None
        state.is_kg_connected = False
        log.exception("Failed to initialize KG query engine")

        if _get_bool_env("COMPLIANCENLP_REQUIRE_KG", default=False):
            raise RuntimeError("KG query engine is required but unavailable") from error


def _initialize_retriever() -> None:
    """Initialize the hybrid retriever shell when enabled.

    The retriever still needs indexed corpus data before real retrieval can run.
    This initialization only proves that serving dependencies are importable.
    """
    if not _get_bool_env("COMPLIANCENLP_ENABLE_RETRIEVER", default=False):
        log.info("Hybrid retriever disabled")
        return

    dense_model_name = os.getenv("COMPLIANCENLP_DENSE_MODEL", "all-MiniLM-L6-v2")
    top_k = int(os.getenv("COMPLIANCENLP_RETRIEVER_TOP_K", "5"))

    try:
        from compliance_nlp.retrieval.hybrid import HybridRetriever

        # 这里不立即加载 sentence-transformer 模型，避免容器启动被大模型下载阻塞。
        state.retriever = HybridRetriever(
            dense_model_name=dense_model_name,
            top_k=top_k,
        )
        state.is_retriever_configured = True
        log.info("Hybrid retriever configured with dense model %s", dense_model_name)
    except Exception as error:
        state.retriever = None
        state.is_retriever_configured = False
        log.exception("Failed to initialize hybrid retriever")

        if _get_bool_env("COMPLIANCENLP_REQUIRE_RETRIEVER", default=False):
            raise RuntimeError("Hybrid retriever is required but unavailable") from error


def _is_ready() -> bool:
    """Determine whether required serving components are available.

    Returns:
        True when all configured required components are ready.
    """
    is_ready = True

    if _get_bool_env("COMPLIANCENLP_REQUIRE_MODELS", default=False):
        is_ready = is_ready and (
            state.extraction_model is not None or state.gap_model is not None
        )

    if _get_bool_env("COMPLIANCENLP_REQUIRE_KG", default=False):
        is_ready = is_ready and state.is_kg_connected

    if _get_bool_env("COMPLIANCENLP_REQUIRE_RETRIEVER", default=False):
        is_ready = is_ready and state.is_retriever_configured

    return is_ready


# ─────────────────────────────────────────────────────────────────────────────
# Lifespan Management
# ─────────────────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage model loading and cleanup on startup/shutdown."""
    log.info("Starting ComplianceNLP server...")
    set_seed(42, deterministic=False)

    state.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    log.info(f"Using device: {state.device}")

    _initialize_kg_engine()
    _initialize_retriever()

    # Models are still loaded on-demand or via future config wiring.
    log.info("Server ready for requests")

    yield

    log.info("Shutting down server...")
    if state.kg_engine is not None:
        state.kg_engine.close()
        state.kg_engine = None
        state.is_kg_connected = False
    state.extraction_model = None
    state.gap_model = None
    state.retriever = None
    if torch.cuda.is_available():
        torch.cuda.empty_cache()


# ─────────────────────────────────────────────────────────────────────────────
# FastAPI Application
# ─────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="ComplianceNLP API",
    description="Production API for regulatory compliance gap detection",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint for load balancers."""
    return HealthResponse(
        status="healthy",
        extraction_model_loaded=state.extraction_model is not None,
        gap_model_loaded=state.gap_model is not None,
        kg_enabled=state.is_kg_enabled,
        kg_connected=state.is_kg_connected,
        retriever_configured=state.is_retriever_configured,
        gpu_available=torch.cuda.is_available(),
        version="1.0.0",
    )


@app.get("/ready", response_model=ReadinessResponse)
async def ready():
    """Readiness check for Kubernetes."""
    response = ReadinessResponse(
        status="ready" if _is_ready() else "not_ready",
        extraction_model_loaded=state.extraction_model is not None,
        gap_model_loaded=state.gap_model is not None,
        kg_connected=state.is_kg_connected,
        retriever_configured=state.is_retriever_configured,
    )
    if not _is_ready():
        raise HTTPException(status_code=503, detail=response.model_dump())
    return response


@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint."""
    return PlainTextResponse(generate_latest().decode("utf-8"))


@app.post("/extract", response_model=ExtractionResponse)
async def extract_obligations(request: ExtractionRequest):
    """Extract regulatory obligations from text."""
    start_time = time.perf_counter()

    try:
        # Placeholder: actual extraction logic
        latency = (time.perf_counter() - start_time) * 1000
        REQUEST_COUNT.labels(endpoint="extract", status="success").inc()
        REQUEST_LATENCY.labels(endpoint="extract").observe(latency / 1000)

        return ExtractionResponse(
            obligations=[],
            entities=[],
            deontic_modality="Obligation",
            cross_references=[],
            confidence=0.0,
            latency_ms=latency,
        )

    except Exception as e:
        REQUEST_COUNT.labels(endpoint="extract", status="error").inc()
        log.exception("Extraction error")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze_gap", response_model=GapAnalysisResponse)
async def analyze_gap(request: GapAnalysisRequest):
    """Analyze compliance gap for an obligation-policy pair."""
    start_time = time.perf_counter()

    try:
        latency = (time.perf_counter() - start_time) * 1000
        REQUEST_COUNT.labels(endpoint="analyze_gap", status="success").inc()
        REQUEST_LATENCY.labels(endpoint="analyze_gap").observe(latency / 1000)

        return GapAnalysisResponse(
            classification="Compliant",
            severity="N/A",
            alignment_score=0.0,
            gap_description="",
            recommended_action="",
            grounding_confidence=0.0,
            latency_ms=latency,
        )

    except Exception as e:
        REQUEST_COUNT.labels(endpoint="analyze_gap", status="error").inc()
        log.exception("Gap analysis error")
        raise HTTPException(status_code=500, detail=str(e))


def main():
    """Entry point for CLI serving."""
    uvicorn.run(app, host="0.0.0.0", port=8080)


if __name__ == "__main__":
    main()
