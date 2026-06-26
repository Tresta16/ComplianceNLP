# Docker Deployment

This project separates long-running online serving from one-off offline jobs.

## Online Serving

Start the API server and Neo4j:

```bash
cp .env.example .env
docker compose up -d --build
```

Start with GPU reservations enabled:

```bash
docker compose -f docker-compose.yml -f docker-compose.gpu.yml up -d --build
```

Check service status:

```bash
curl http://localhost:30020
curl http://localhost:8080/health
curl http://localhost:8080/ready
```

The frontend is served on `http://localhost:30020` by default and proxies
`/health`, `/ready`, and `/api/*` requests to the FastAPI container.

## Development With Live Reload

Use the development override when you want frontend hot reload and backend
auto-reload while keeping Neo4j and Docker networking the same:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Open the frontend at:

```bash
http://localhost:30020
```

In this mode:

- React/Vite files under `frontend/` are bind-mounted into the frontend
  container and update through Vite hot module replacement.
- Python files under `src/` are bind-mounted into the serving container and
  reload through `uvicorn --reload`.
- You do not need `docker compose down && docker compose up` after each source
  edit.

If you only changed source files, keep the stack running. If you changed
dependencies, Dockerfiles, or compose settings, rebuild the affected services:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build frontend compliancenlp-serving
```

Stop the development stack when you are done:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

## Knowledge Graph Ingestion

Place regulatory source files under:

```text
data/sec_edgar/
data/eurlex/
data/bis_pdf/
```

Build or update the Neo4j knowledge graph:

```bash
docker compose --profile ingestion run --rm kg-builder
```

## Training Jobs

Train the extraction model:

```bash
docker compose --profile train-extraction run --rm extraction-trainer
```

Distill or fine-tune the gap analysis model:

```bash
docker compose --profile train-gap run --rm gap-trainer
```

Train Medusa heads:

```bash
docker compose --profile train-medusa run --rm medusa-trainer
```

Use the GPU override for GPU-backed training:

```bash
docker compose -f docker-compose.yml -f docker-compose.gpu.yml \
  --profile train-extraction run --rm extraction-trainer
```

## Evaluation

Run evaluation against generated outputs:

```bash
docker compose --profile evaluation run --rm evaluator
```

## Storage Layout

The compose file mounts these local directories into containers:

```text
data/      Input datasets and regulatory source files.
outputs/   Model checkpoints, KG outputs, and evaluation results.
```

Neo4j and model cache use Docker named volumes:

```text
neo4j_data   Persistent Neo4j database files.
neo4j_logs   Persistent Neo4j logs.
model_cache  HuggingFace and model cache files.
```
