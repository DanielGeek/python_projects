# 19-docker-compose — Docker Compose for MLOps

This module demonstrates how to wrap a simple Flask web application inside a Docker container, configure port mapping, and manage container lifecycles.

---

## Commands

### 1. Environment Setup (Local Development)

```bash
# Create conda environment
conda create -p venv python=3.10 -c conda-forge -y

# Activate environment
conda activate ./venv

# Install dependencies
pip install -r requirements.txt

# Run app locally
python app.py
```

---

## Docker Workflow

### 1. Build the Docker Image

```bash
docker compose up
```

```bash
docker compose stop
```

> **Note:** Port `5001` is used to avoid conflicts with macOS AirPlay Receiver (which defaults to port `5000`).

### 3. Stop a Running Container

```bash
# List running containers
docker ps

# Stop container by ID or Name
docker stop <CONTAINER_ID>
```
