"""Inference routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from compliance_nlp.api.deps import get_inference_service
from compliance_nlp.api.schemas.inference import (
    ExtractionRequest,
    ExtractionResponse,
    GapAnalysisRequest,
    GapAnalysisResponse,
)
from compliance_nlp.api.services import InferenceService

router = APIRouter(tags=["inference"])


@router.post("/extract", response_model=ExtractionResponse)
async def extract_obligations(
    request: ExtractionRequest,
    inference_service: InferenceService = Depends(get_inference_service),
) -> ExtractionResponse:
    """抽取法规义务。

    Args:
        request: 义务抽取请求体。
        inference_service: 在线推理服务。

    Returns:
        义务抽取响应。

    Raises:
        HTTPException: 推理服务抛出异常时返回 500。
    """

    try:
        return await inference_service.extract_obligations(request)
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error


@router.post("/analyze_gap", response_model=GapAnalysisResponse)
async def analyze_gap(
    request: GapAnalysisRequest,
    inference_service: InferenceService = Depends(get_inference_service),
) -> GapAnalysisResponse:
    """分析法规义务和内部政策之间的差距。

    Args:
        request: 差距分析请求体。
        inference_service: 在线推理服务。

    Returns:
        差距分析响应。

    Raises:
        HTTPException: 推理服务抛出异常时返回 500。
    """

    try:
        return await inference_service.analyze_gap(request)
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error

