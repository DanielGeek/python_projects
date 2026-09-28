# Grafana Observability — Banking Transaction Stream

Near real-time **fraud-rule simulation** that generates synthetic banking transactions, evaluates simple decision rules, and streams results into **PostgreSQL** for visualization in **Grafana**.

Local Postgres runs via **Docker Compose** (`postgres:16-alpine`); the same `.env` keys also work against AWS RDS.

---

## Overview

1. **Synthetic data** — Faker + random merchants/cards/amounts  
2. **Rule engine** — approve / reject based on amount, blacklist, and transaction type  
3. **Persist** — insert batches into `banking_data` every N seconds  
4. **Observe** — query Postgres from Grafana (stats, pie charts, bars)  

---

## Tech Stack

| Layer | Tools |
| --- | --- |
| Language | Python 3.10 |
| Data | pandas, Faker |
| Database | PostgreSQL 16 (Docker) or AWS RDS |
| Driver | `psycopg2-binary` |
| Config | `python-dotenv` (`.env`) |
| Viz | Grafana (external) + SQL in `queries.txt` |
| Research | Jupyter (`app.ipynb`) |

---

## Project Structure

```text
27-grafana/
├── app.ipynb              # Generator + rules + DB insert loop
├── docker-compose.yml     # Official Postgres 16 (Alpine)
├── queries.txt            # Sample Grafana panel SQL
├── .env.example           # Host, credentials, batch settings
├── requirements.txt
└── README.md
```

---

## Setup

### Prerequisites

- Python **3.10**
- Docker Desktop (for local Postgres)
- Optional: Grafana (local or cloud) connected to the same DB

### Installation

```bash
cd 27-grafana

conda create -p venv python==3.10 -y
conda activate ./venv
pip install -r requirements.txt

cp .env.example .env
```

### Postgres with Docker (recommended locally)

```bash
# Start Postgres (credentials from .env)
docker compose up -d

docker compose ps
docker compose logs -f postgres

# Stop (keeps volume)
docker compose down

# Stop and wipe data
docker compose down -v
```

Default local connection:

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

---

## Run

```bash
conda activate ./venv
docker compose up -d

# Open app.ipynb — select the ./venv kernel
# Cell 1: rule helpers
# Cell 2: connect, create table, stream inserts (Ctrl+C / interrupt to stop)
```

The notebook loads `.env` with `load_dotenv()` before connecting.

---

## Grafana panels

Use the SQL snippets in `queries.txt`, for example:

| Panel idea | Viz type |
| --- | --- |
| Rejected / approved counts | Stat |
| Total approved / rejected amount | Stat |
| Transaction types | Pie chart |
| Rules triggered | Bar chart |
| Blacklisted accounts | Bar chart |

Connect Grafana to `localhost:5432` (Docker) with the same user/password as `.env`.

---

## Notes

- Prefer **`psycopg2-binary`** on macOS (avoids OpenSSL `libssl.1.1` link errors from plain `psycopg2`).
- `.env` is gitignored; commit only `.env.example`.
