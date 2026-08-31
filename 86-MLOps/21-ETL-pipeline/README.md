# 21 — ETL Pipeline: NASA APOD API → Airflow → PostgreSQL

An end-to-end **ETL (Extract, Transform, Load)** pipeline built with **Apache Airflow** (via Astronomer Astro CLI) that:
- **Extracts** the NASA Astronomy Picture of the Day (APOD) via the public NASA API
- **Transforms** the JSON response to select relevant fields
- **Loads** the cleaned data into a PostgreSQL database

The entire workflow is orchestrated by a daily Airflow DAG (`nasa_apod_postgres`) and runs in isolated Docker containers managed by Astro CLI.

---

## Key Components

| Component | Technology | Role |
|---|---|---|
| **Orchestration** | Apache Airflow (Astro Runtime) | DAG scheduling, task dependencies, monitoring |
| **Extract** | `HttpOperator` (`airflow-providers-http`) | HTTP GET to NASA APOD REST API |
| **Transform** | `@task` (TaskFlow API) | Filter and format JSON fields |
| **Load** | `PostgresHook` (`airflow-providers-postgres`) | INSERT into `apod_data` table |
| **Database** | PostgreSQL 13 (Docker) | Persistent data store via Docker volume |

---

## DAG: `nasa_apod_postgres`

**File:** [`dags/etl.py`](dags/etl.py)  
**Schedule:** `@daily`  
**Start date:** `2024-01-01` | `catchup=False`

### Task Pipeline

```
create_table >> extract_apod >> transform_apod_data >> load_data_to_postgres
```

| Step | Task ID | Type | Description |
|---|---|---|---|
| 1 | `create_table` | `@task` | Creates `apod_data` table in Postgres if it doesn't exist |
| 2 | `extract_apod` | `HttpOperator` | GET `https://api.nasa.gov/planetary/apod?api_key=...` |
| 3 | `transform_apod_data` | `@task` | Extracts `title`, `explanation`, `url`, `date`, `media_type` from JSON |
| 4 | `load_data_to_postgres` | `@task` | INSERTs transformed data into the `apod_data` table |

### Postgres Table Schema

```sql
CREATE TABLE IF NOT EXISTS apod_data (
    id         SERIAL PRIMARY KEY,
    title      VARCHAR(255),
    explanation TEXT,
    url        TEXT,
    date       DATE,
    media_type VARCHAR(50)
);
```

---

## Project Structure

```
21-ETL-pipeline/
├── dags/
│   └── etl.py               # Main ETL DAG definition
├── docker-compose.yml        # Postgres 13 container + named volume + network
├── requirements.txt          # Airflow providers (http, postgres)
├── airflow_settings.yaml     # Local Airflow connections/variables config template
├── Dockerfile                # Astro Runtime base image
├── packages.txt              # OS-level packages (empty by default)
├── plugins/                  # Custom Airflow plugins (empty by default)
├── include/                  # Extra files (empty by default)
├── tests/                    # DAG integrity tests
└── README.md                 # This file
```

---

## Setup & Running

### Prerequisites
- [Astronomer CLI](https://docs.astronomer.io/astro/cli/install-cli) (`astro`)
- Docker Desktop (running)
- A free [NASA API key](https://api.nasa.gov/)

### 1. Start Airflow with Astro CLI

```bash
cd 21-ETL-pipeline

# Start all Airflow services (Scheduler, Webserver, Triggerer, Postgres, DAG Processor)
astro dev start
```

Airflow UI will be available at: **http://21-etl-pipeline.localhost:6563**  
Default credentials: `admin` / `admin`

### 2. Configure Airflow Connections

Go to **Admin → Connections** in the Airflow UI and add:

**Connection 1 — NASA API:**
| Field | Value |
|---|---|
| Connection ID | `nasa_api` |
| Connection Type | `HTTP` |
| Host | `https://api.nasa.gov` |
| Extra (JSON) | `{"api_key": "YOUR_NASA_API_KEY"}` |

**Connection 2 — Postgres:**
| Field | Value |
|---|---|
| Connection ID | `my_postgres_connection` |
| Connection Type | `Postgres` |
| Host | `postgres` |
| Schema | `postgres` |
| Login | `postgres` |
| Password | `postgres` |
| Port | `5432` |

### 3. Trigger the DAG

In the Airflow UI, enable and trigger the `nasa_apod_postgres` DAG manually or let it run on its `@daily` schedule.

---

## Commands

```bash
# Start Airflow
astro dev start

# Stop Airflow
astro dev stop

# Restart (needed after changes to requirements.txt or Dockerfile)
astro dev restart

# Validate DAG syntax
astro dev parse

# Install Airflow providers locally (for IDE type checking)
python -m pip install apache-airflow apache-airflow-providers-http apache-airflow-providers-postgres
```

---

## Key Concepts Learned

- **`HttpOperator`** (renamed from `SimpleHttpOperator` in `apache-airflow-providers-http >= 6.0`) — makes HTTP requests to external APIs
- **`PostgresHook`** — connects and runs SQL against a Postgres database using an Airflow connection ID
- **`response_filter`** — converts raw API responses to Python dicts using a lambda
- **`catchup=False`** + fixed `start_date` — best practice to avoid backfill execution on old dates
- **`days_ago()` is removed** in modern Airflow; use `datetime(2024, 1, 1)` instead
- **Airflow Connections** — store credentials securely outside code (API keys, DB passwords)
