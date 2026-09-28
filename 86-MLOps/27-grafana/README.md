## Grafana Project

Streaming banking transactions into PostgreSQL for Grafana dashboards.

## Setup

```bash
cd 27-grafana

conda create -p venv python==3.10 -y
conda activate ./venv
pip install -r requirements.txt

cp .env.example .env
```

### Postgres with Docker (recommended locally)

Uses the official `postgres:16-alpine` image via Compose (no custom Dockerfile needed).

```bash
# Start Postgres (reads credentials from .env)
docker compose up -d

# Check health
docker compose ps
docker compose logs -f postgres

# Stop (keeps data volume)
docker compose down

# Stop and wipe data
docker compose down -v
```

Point `.env` at local Docker:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

For AWS RDS, keep the same keys and set `POSTGRES_HOST` to your RDS endpoint.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `POSTGRES_HOST` | `localhost` (Docker) or RDS hostname |
| `POSTGRES_PORT` | Port (default `5432`) |
| `POSTGRES_DB` | Database name |
| `POSTGRES_USER` | DB user |
| `POSTGRES_PASSWORD` | DB password |
| `NUM_RECORDS` | Rows inserted per batch |
| `INSERT_INTERVAL_SECONDS` | Sleep between batches |

Then open `app.ipynb` and run the cells (kernel = `./venv`).
