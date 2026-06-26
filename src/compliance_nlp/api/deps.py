"""FastAPI dependencies for the API layer."""

from __future__ import annotations

from compliance_nlp.api.runtime import ModelState, state
from compliance_nlp.api.services import InferenceService
from compliance_nlp.api.settings import ApiSettings, load_api_settings


def get_api_settings() -> ApiSettings:
    """提供 API 配置依赖。

    Returns:
        从环境变量读取的 API 配置。
    """

    return load_api_settings()


def get_model_state() -> ModelState:
    """提供进程级模型状态依赖。

    Returns:
        当前进程共享的模型状态对象。
    """

    return state


def get_inference_service() -> InferenceService:
    """提供在线推理服务依赖。

    Returns:
        使用当前进程模型状态创建的推理服务。
    """

    return InferenceService(model_state=state)
