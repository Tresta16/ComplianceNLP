"""Compatibility entry point for the ComplianceNLP FastAPI server.

The real API implementation now lives under `compliance_nlp.api`. This module
keeps the historical import path working:

    uvicorn compliance_nlp.serving.server:app --host 0.0.0.0 --port 8080
"""

from __future__ import annotations

from compliance_nlp.api.main import app, create_app, main
from compliance_nlp.api.metrics import BATCH_SIZE, REQUEST_COUNT, REQUEST_LATENCY
from compliance_nlp.api.runtime import (
    ModelState,
    build_health_response,
    build_readiness_response,
    initialize_kg_engine,
    initialize_retriever,
    is_ready,
    start_serving_runtime,
    state,
    stop_serving_runtime,
)
from compliance_nlp.api.schemas import (
    BatchExtractionRequest,
    ExtractionRequest,
    ExtractionResponse,
    GapAnalysisRequest,
    GapAnalysisResponse,
    HealthResponse,
    ReadinessResponse,
)

__all__ = [
    "BATCH_SIZE",
    "BatchExtractionRequest",
    "ExtractionRequest",
    "ExtractionResponse",
    "GapAnalysisRequest",
    "GapAnalysisResponse",
    "HealthResponse",
    "ModelState",
    "REQUEST_COUNT",
    "REQUEST_LATENCY",
    "ReadinessResponse",
    "app",
    "build_health_response",
    "build_readiness_response",
    "create_app",
    "initialize_kg_engine",
    "initialize_retriever",
    "is_ready",
    "main",
    "start_serving_runtime",
    "state",
    "stop_serving_runtime",
]


if __name__ == "__main__":
    main()
