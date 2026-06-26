"""Prometheus metrics for the serving API."""

from __future__ import annotations

from prometheus_client import Counter, Histogram


REQUEST_COUNT = Counter(
    "compliancenlp_requests_total",
    "Total inference requests",
    ["endpoint", "status"],
)
REQUEST_LATENCY = Histogram(
    "compliancenlp_latency_seconds",
    "Inference latency in seconds",
    ["endpoint"],
    buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0],
)
BATCH_SIZE = Histogram(
    "compliancenlp_batch_size",
    "Batch size per request",
    buckets=[1, 2, 4, 8, 16, 32, 64],
)
