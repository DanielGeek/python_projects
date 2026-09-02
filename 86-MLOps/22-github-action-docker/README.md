# 22 — GitHub Actions CI/CD + Docker (Flask App)

A complete **CI/CD pipeline** built with **GitHub Actions** that automatically tests, builds, and publishes a Dockerized Flask application to **Docker Hub** on every push to `main`. Includes multi-platform image support for both `linux/amd64` (Intel/AMD) and `linux/arm64` (Apple Silicon).

**GitHub repository:** [`github.com/DanielGeek/github-action-docker`](https://github.com/DanielGeek/github-action-docker)  
**Docker Hub image:** [`danielangelgeek/flasktest-app`](https://hub.docker.com/r/danielangelgeek/flasktest-app)

---

## Project Overview

| Component | Technology | Role |
|---|---|---|
| **Web App** | Flask (Python 3.10) | Minimal `Hello World!` HTTP server on port 5001 |
| **Tests** | pytest | Validates `/` route returns 200 and correct body |
| **Containerization** | Docker (`python:3.10-slim`) | Packages the app into a portable image |
| **CI/CD** | GitHub Actions | Automated test → build → publish on every push |
| **Registry** | Docker Hub | Stores and serves the published image |
| **Platforms** | `linux/amd64` + `linux/arm64` | Compatible with Intel/AMD and Apple Silicon |

---

## Project Structure

```
github-action-docker/
├── app.py                          # Flask application (Hello World on port 5001)
├── test_app.py                     # pytest unit tests for the Flask app
├── DockerFile                      # Docker image definition (python:3.10-slim)
├── requirements.txt                # Python dependencies (Flask, pytest)
└── .github/
    └── workflows/
        └── ci-cd.yml               # GitHub Actions CI/CD pipeline
```

---

## Application

### `app.py`
```python
from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "Hello World!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
```

### `test_app.py`
```python
from app import app

def test_home():
    response = app.test_client().get("/")
    assert response.status_code == 200
    assert response.data == b"Hello World!"
```

---

## CI/CD Pipeline — GitHub Actions

**File:** [`.github/workflows/ci-cd.yml`](../../github-action-docker/.github/workflows/ci-cd.yml)  
**Trigger:** push or pull_request to `main`

### Pipeline Flow

```
dockerbuild ──────────────────────────────────────────────────────► (parallel)
build-and-test ──► build-and-publish ──► Docker Hub (multi-platform)
```

### Jobs

| Job | Runs on | Description |
|---|---|---|
| `dockerbuild` | `ubuntu-latest` | Quick smoke test: builds the image with a timestamped tag |
| `build-and-test` | `ubuntu-latest` | Installs dependencies and runs `pytest` |
| `build-and-publish` | `ubuntu-latest` | Builds multi-platform image and pushes to Docker Hub |

### `build-and-publish` Steps

1. **`setup-qemu-action@v3`** — Installs QEMU CPU emulator (required to build ARM64 images on AMD64 runners)
2. **`setup-buildx-action@v3`** — Enables Docker Buildx (multi-platform builder)
3. **`login-action@v3`** — Authenticates to Docker Hub using repository secrets
4. **`build-push-action@v5`** — Builds and pushes image for `linux/amd64` and `linux/arm64`

---

## Docker Hub Secrets Required

Add these in your GitHub repository under **Settings → Secrets and Variables → Actions**:

| Secret Name | Value |
|---|---|
| `DOCKER_USERNAME` | Your Docker Hub username (e.g. `danielangelgeek`) |
| `DOCKER_PASSWORD` | Your Docker Hub access token (not your password) |

---

## Running Locally

### Option A: Run with Python directly
```bash
# Install dependencies
pip install flask pytest

# Run tests
pytest

# Run the app
python app.py
# App available at http://localhost:5001
```

### Option B: Run with Docker (pull from Docker Hub)
```bash
# Pull the published multi-platform image
docker pull danielangelgeek/flasktest-app

# Run the container
docker run -p 5001:5001 danielangelgeek/flasktest-app
# App available at http://localhost:5001
```

### Option C: Build and run locally from source
```bash
# Build the image
docker build -t flasktest-app . -f DockerFile

# Run the container
docker run -p 5001:5001 flasktest-app
```

---

## Key Concepts Learned

- **GitHub Actions workflow** — `on: push/pull_request`, `jobs`, `steps`, `needs` for job dependencies
- **Docker Buildx + QEMU** — enables cross-platform builds (`linux/arm64`) on `linux/amd64` GitHub runners
- **Multi-platform images** — `platforms: linux/amd64,linux/arm64` produces a manifest list compatible with both architectures (fixes `no matching manifest for linux/arm64/v8` on Apple Silicon)
- **Docker Hub secrets** — `DOCKER_USERNAME` and `DOCKER_PASSWORD` stored securely as GitHub repository secrets
- **pytest with Flask test client** — `app.test_client().get("/")` for in-process HTTP testing without a running server
