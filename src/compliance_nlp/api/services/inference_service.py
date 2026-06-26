"""Inference orchestration service."""

from __future__ import annotations

import time

from loguru import logger

from compliance_nlp.api import metrics
from compliance_nlp.api.runtime import ModelState, state
from compliance_nlp.api.schemas.inference import (
    ExtractionRequest,
    ExtractionResponse,
    GapAnalysisRequest,
    GapAnalysisResponse,
)


class InferenceService:
    """封装在线推理编排逻辑。

    当前方法仍返回 placeholder 结果；这样 route 层可以先稳定下来，后续再把真实模型
    调用接入到这个服务类中。
    """

    def __init__(self, model_state: ModelState = state) -> None:
        """初始化推理服务。

        Args:
            model_state: 当前进程的模型和依赖状态。
        """

        self._model_state = model_state

    async def extract_obligations(self, request: ExtractionRequest) -> ExtractionResponse:
        """抽取法规文本中的义务。

        Args:
            request: 义务抽取请求。

        Returns:
            义务抽取响应；当前为兼容旧接口的占位结果。

        Raises:
            Exception: 未来真实推理异常会向 route 层传播并转换为 HTTP 500。
        """

        start_time = time.perf_counter()

        try:
            latency_ms = self._elapsed_ms(start_time)
            metrics.REQUEST_COUNT.labels(endpoint="extract", status="success").inc()
            metrics.REQUEST_LATENCY.labels(endpoint="extract").observe(latency_ms / 1000)

            return ExtractionResponse(
                obligations=[],
                entities=[],
                deontic_modality="Obligation",
                cross_references=[],
                confidence=0.0,
                latency_ms=latency_ms,
            )
        except Exception:
            metrics.REQUEST_COUNT.labels(endpoint="extract", status="error").inc()
            logger.exception("Extraction error")
            raise

    async def analyze_gap(self, request: GapAnalysisRequest) -> GapAnalysisResponse:
        """分析法规义务与内部政策之间的合规差距。

        Args:
            request: 合规差距分析请求。

        Returns:
            差距分析响应；当前为兼容旧接口的占位结果。

        Raises:
            Exception: 未来真实推理异常会向 route 层传播并转换为 HTTP 500。
        """

        start_time = time.perf_counter()

        try:
            latency_ms = self._elapsed_ms(start_time)
            metrics.REQUEST_COUNT.labels(endpoint="analyze_gap", status="success").inc()
            metrics.REQUEST_LATENCY.labels(endpoint="analyze_gap").observe(latency_ms / 1000)

            return GapAnalysisResponse(
                classification="Compliant",
                severity="N/A",
                alignment_score=0.0,
                gap_description="",
                recommended_action="",
                grounding_confidence=0.0,
                latency_ms=latency_ms,
            )
        except Exception:
            metrics.REQUEST_COUNT.labels(endpoint="analyze_gap", status="error").inc()
            logger.exception("Gap analysis error")
            raise

    @staticmethod
    def _elapsed_ms(start_time: float) -> float:
        """计算请求耗时。

        Args:
            start_time: `time.perf_counter()` 返回的请求开始时间。

        Returns:
            从开始时间到当前时间的毫秒数。
        """

        return (time.perf_counter() - start_time) * 1000

