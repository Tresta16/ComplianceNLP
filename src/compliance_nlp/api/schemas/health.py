"""Health and readiness response schemas."""

from __future__ import annotations

from pydantic import BaseModel


class HealthResponse(BaseModel):
    """服务健康检查响应。

    这个模型描述进程是否存活，以及可选依赖是否已经初始化。
    """

    status: str
    extraction_model_loaded: bool
    gap_model_loaded: bool
    kg_enabled: bool
    kg_connected: bool
    retriever_configured: bool
    gpu_available: bool
    version: str


class ReadinessResponse(BaseModel):
    """服务就绪检查响应。

    这个模型用于负载均衡或 Kubernetes 判断服务是否可以接收业务流量。
    """

    status: str
    extraction_model_loaded: bool
    gap_model_loaded: bool
    kg_connected: bool
    retriever_configured: bool

