"""Environment-driven settings for the serving API."""

from __future__ import annotations

import os
from dataclasses import dataclass


DEFAULT_API_HOST = "0.0.0.0"
DEFAULT_API_PORT = 8080
DEFAULT_KG_MAX_HOPS = 3
DEFAULT_RETRIEVER_TOP_K = 5
DEFAULT_NEO4J_URI = "bolt://localhost:7687"
DEFAULT_NEO4J_USER = "neo4j"
DEFAULT_DENSE_MODEL = "all-MiniLM-L6-v2"
API_VERSION = "1.0.0"


def parse_bool_env(name: str, default: bool = False) -> bool:
    """读取布尔环境变量。

    Args:
        name: 环境变量名称。
        default: 环境变量缺失时使用的默认值。

    Returns:
        解析后的布尔值。

    Raises:
        ValueError: 环境变量存在但不是可识别的布尔字符串。
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


def parse_int_env(name: str, default: int) -> int:
    """读取整型环境变量。

    Args:
        name: 环境变量名称。
        default: 环境变量缺失时使用的默认值。

    Returns:
        解析后的整数值。

    Raises:
        ValueError: 环境变量存在但不能转换为整数。
    """

    value = os.getenv(name)
    if value is None:
        return default

    return int(value)


@dataclass(frozen=True)
class ApiSettings:
    """API 运行配置。

    这个对象把零散的环境变量收敛到一个结构里，便于测试和替换。
    """

    host: str
    port: int
    version: str
    enable_kg: bool
    require_kg: bool
    enable_retriever: bool
    require_retriever: bool
    require_models: bool
    neo4j_uri: str
    neo4j_user: str
    neo4j_password: str
    kg_max_hops: int
    dense_model_name: str
    retriever_top_k: int


def load_api_settings() -> ApiSettings:
    """从环境变量构建 API 配置。

    Returns:
        当前进程的 API 配置快照。

    Raises:
        ValueError: 环境变量格式不合法。
    """

    return ApiSettings(
        host=os.getenv("COMPLIANCENLP_HOST", DEFAULT_API_HOST),
        port=parse_int_env("COMPLIANCENLP_PORT", DEFAULT_API_PORT),
        version=API_VERSION,
        enable_kg=parse_bool_env("COMPLIANCENLP_ENABLE_KG", default=False),
        require_kg=parse_bool_env("COMPLIANCENLP_REQUIRE_KG", default=False),
        enable_retriever=parse_bool_env("COMPLIANCENLP_ENABLE_RETRIEVER", default=False),
        require_retriever=parse_bool_env("COMPLIANCENLP_REQUIRE_RETRIEVER", default=False),
        require_models=parse_bool_env("COMPLIANCENLP_REQUIRE_MODELS", default=False),
        neo4j_uri=os.getenv("COMPLIANCENLP_NEO4J_URI", DEFAULT_NEO4J_URI),
        neo4j_user=os.getenv("COMPLIANCENLP_NEO4J_USER", DEFAULT_NEO4J_USER),
        neo4j_password=os.getenv("COMPLIANCENLP_NEO4J_PASSWORD", ""),
        kg_max_hops=parse_int_env("COMPLIANCENLP_KG_MAX_HOPS", DEFAULT_KG_MAX_HOPS),
        dense_model_name=os.getenv("COMPLIANCENLP_DENSE_MODEL", DEFAULT_DENSE_MODEL),
        retriever_top_k=parse_int_env("COMPLIANCENLP_RETRIEVER_TOP_K", DEFAULT_RETRIEVER_TOP_K),
    )

