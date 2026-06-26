"""FastAPI application factory for ComplianceNLP."""

from __future__ import annotations

from collections.abc import AsyncIterator, Callable
from contextlib import asynccontextmanager
from typing import AsyncContextManager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from compliance_nlp.api import runtime
from compliance_nlp.api.deps import get_api_settings
from compliance_nlp.api.routes import health, inference, metrics
from compliance_nlp.api.settings import ApiSettings, load_api_settings


def create_settings_dependency(settings: ApiSettings) -> Callable[[], ApiSettings]:
    """创建固定配置依赖。

    Args:
        settings: 需要注入到 route 中的 API 配置。

    Returns:
        FastAPI dependency 函数。
    """

    def provide_settings() -> ApiSettings:
        """返回 app factory 解析出的配置。

        Returns:
            当前 FastAPI 应用绑定的 API 配置。
        """

        return settings

    return provide_settings


def create_lifespan(settings: ApiSettings) -> Callable[[FastAPI], AsyncContextManager[None]]:
    """创建 FastAPI lifespan 回调。

    Args:
        settings: API 运行配置。

    Returns:
        可传给 FastAPI 的异步 lifespan 上下文管理器。
    """

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        """管理应用启动和关闭过程。

        Args:
            app: FastAPI 应用实例。

        Yields:
            应用运行期间的控制权。
        """

        runtime.start_serving_runtime(settings)
        yield
        runtime.stop_serving_runtime()

    return lifespan


def create_app(settings: ApiSettings | None = None) -> FastAPI:
    """创建 FastAPI 应用。

    Args:
        settings: 可选的 API 配置；测试可以传入自定义配置。

    Returns:
        已注册中间件和路由的 FastAPI 应用。
    """

    resolved_settings = settings or load_api_settings()
    fastapi_app = FastAPI(
        title="ComplianceNLP API",
        description="Production API for regulatory compliance gap detection",
        version=resolved_settings.version,
        lifespan=create_lifespan(resolved_settings),
    )

    fastapi_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
    fastapi_app.dependency_overrides[get_api_settings] = create_settings_dependency(
        resolved_settings,
    )

    # 当前仍保留根路径，避免破坏 Docker/K8s/前端代理里已有的调用方式。
    fastapi_app.include_router(health.router)
    fastapi_app.include_router(metrics.router)
    fastapi_app.include_router(inference.router)

    return fastapi_app


app = create_app()


def main() -> None:
    """启动 uvicorn 服务。

    这个入口被 `compliancenlp-serve` 命令和旧的 serving wrapper 复用。
    """

    settings = load_api_settings()
    uvicorn.run(app, host=settings.host, port=settings.port)


if __name__ == "__main__":
    main()
