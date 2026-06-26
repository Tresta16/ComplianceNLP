"""Inference request and response schemas."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ExtractionRequest(BaseModel):
    """义务抽取请求。

    Attributes:
        text: 需要抽取义务的法规文本。
        framework: 法规框架名称，允许前端传入 SEC、MiFID II、Basel III 或 auto。
    """

    text: str = Field(..., description="Regulatory text to extract obligations from", max_length=10000)
    framework: str = Field(
        default="auto",
        description="Regulatory framework (SEC, MiFID II, Basel III, auto)",
    )


class GapAnalysisRequest(BaseModel):
    """合规差距分析请求。

    Attributes:
        obligation_text: 已格式化的法规义务文本。
        policy_text: 内部制度或政策条款文本。
        policy_section: 内部政策章节标识。
        context_passages: 检索增强时使用的上下文段落。
    """

    obligation_text: str = Field(..., description="Formatted obligation text")
    policy_text: str = Field(..., description="Internal policy clause text")
    policy_section: str = Field(default="", description="Policy section identifier")
    context_passages: list[str] = Field(
        default_factory=list,
        description="Retrieved context passages",
    )


class BatchExtractionRequest(BaseModel):
    """批量义务抽取请求。

    Attributes:
        texts: 需要批量处理的法规文本列表。
        framework: 法规框架名称。
    """

    texts: list[str] = Field(..., description="List of regulatory texts", max_length=64)
    framework: str = Field(default="auto")


class ExtractionResponse(BaseModel):
    """义务抽取响应。

    Attributes:
        obligations: 抽取出的义务结构列表；当前服务仍返回占位空列表。
        entities: 抽取出的实体结构列表；当前服务仍返回占位空列表。
        deontic_modality: 义务模态。
        cross_references: 跨引用条款列表。
        confidence: 模型置信度。
        latency_ms: 接口处理耗时，单位毫秒。
    """

    obligations: list[dict[str, Any]]
    entities: list[dict[str, Any]]
    deontic_modality: str
    cross_references: list[str]
    confidence: float
    latency_ms: float


class GapAnalysisResponse(BaseModel):
    """合规差距分析响应。

    Attributes:
        classification: 差距分类结果。
        severity: 严重程度。
        alignment_score: 义务与政策的对齐分数。
        gap_description: 差距描述。
        recommended_action: 建议动作。
        grounding_confidence: 证据支撑置信度。
        latency_ms: 接口处理耗时，单位毫秒。
    """

    classification: str
    severity: str
    alignment_score: float
    gap_description: str
    recommended_action: str
    grounding_confidence: float
    latency_ms: float
