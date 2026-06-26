"""Prometheus metrics route."""

from __future__ import annotations

from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
from prometheus_client import generate_latest

router = APIRouter(tags=["metrics"])


@router.get("/metrics")
async def metrics() -> PlainTextResponse:
    """返回 Prometheus 指标文本。

    Returns:
        Prometheus exposition format 响应。
    """

    return PlainTextResponse(generate_latest().decode("utf-8"))

