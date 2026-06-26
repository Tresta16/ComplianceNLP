"""Health and readiness routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from compliance_nlp.api import runtime
from compliance_nlp.api.deps import get_api_settings
from compliance_nlp.api.schemas.health import HealthResponse, ReadinessResponse
from compliance_nlp.api.settings import ApiSettings

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health(settings: ApiSettings = Depends(get_api_settings)) -> HealthResponse:
    """返回服务健康状态。

    Args:
        settings: 通过依赖注入提供的 API 配置。

    Returns:
        健康检查响应。
    """

    return runtime.build_health_response(settings)


@router.get("/ready", response_model=ReadinessResponse)
async def ready(settings: ApiSettings = Depends(get_api_settings)) -> ReadinessResponse:
    """返回服务就绪状态。

    Args:
        settings: 通过依赖注入提供的 API 配置。

    Returns:
        就绪检查响应。

    Raises:
        HTTPException: 依赖不满足就绪条件时返回 503。
    """

    response = runtime.build_readiness_response(settings)
    if not runtime.is_ready(settings):
        raise HTTPException(status_code=503, detail=response.model_dump())

    return response

