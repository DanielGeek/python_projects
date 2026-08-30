# 20-airflow-astro — Apache Airflow with Astronomer CLI (Astro)

A comprehensive hands-on module for workflow orchestration using **Apache Airflow** powered by the **Astronomer CLI (`astro`)**.

This module demonstrates creating, testing, and running Airflow DAGs using both traditional `PythonOperator` with XComs and modern **TaskFlow API (`@task` decorator)** workflows.

---

## Project Contents & DAGs

The `dags/` directory includes the following pipeline examples:

| DAG ID | File | Description | Key Features |
|---|---|---|---|
| `example_astronauts` | `dags/exampledag.py` | ETL pipeline querying astronauts currently in space from the Open Notify API. | Dynamic task mapping, TaskFlow API. |
| `ml_pipeline` | `dags/mlpipeline.py` | Multi-stage Machine Learning pipeline (`preprocess_task` -> `train_task` -> `evaluate_task`). | Sequential dependencies (`>>`), modern Airflow `schedule='@weekly'`. |
| `maths_sequence_dag` | `dags/maths_operation.py` | Mathematical sequence execution demonstrating inter-task communication. | Traditional `PythonOperator`, `xcom_push` and `xcom_pull` across tasks. |
| `math_sequence_dag_with_taskflow` | `dags/taskflowapi.py` | Mathematical sequence pipeline implemented with modern TaskFlow API. | `@task` decorator, automatic XCom serialization and clean function calls. |

---

## Local Development with Astro CLI

### 1. Prerequisites
- Docker Desktop installed and running
- Astronomer CLI (`astro`) installed (`brew install astro`)

### 2. Command Reference

```bash
# Initialize Astro project (already configured)
astro dev init

# Start Airflow locally (spins up Postgres, Webserver/API, Scheduler, Triggerer, DAG Processor)
astro dev start

# Parse and validate DAG integrity without syntax/import errors
astro dev parse

# Stop the Airflow environment
astro dev stop

# Restart containers
astro dev restart

# View container logs
astro dev logs --scheduler
astro dev logs --webserver
```

---

## Accessing the Airflow UI

When all containers are running after `astro dev start`:
- **Airflow Web UI**: [http://localhost:8080](http://localhost:8080) (or the mapped localhost port shown in terminal)
- **Metadata Database**: PostgreSQL at `localhost:5432/postgres` (User: `postgres`, Password: `postgres`)
