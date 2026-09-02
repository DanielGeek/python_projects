# 86-MLOps — Python Foundations for Machine Learning

A comprehensive, hands-on Python course designed as the **foundational pillar** for an MLOps learning path. This project covers core to advanced Python concepts through practical Jupyter notebooks, sample scripts, and real-world data analysis exercises.

The curriculum progresses from **Python basics** (syntax, variables, data types) all the way to **file handling, OOP, advanced concepts (generators, decorators), data analysis with NumPy/Pandas, logging, and Flask web development** — providing a solid programming base before diving into machine learning and MLOps tooling.

---

## Table of Contents

- [Modules Overview](#modules-overview)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Running Notebooks](#running-notebooks)
- [Helpful Commands](#helpful-commands)
- [Dependencies](#dependencies)
- [License](#license)

---

## Modules Overview

| # | Module | Topics Covered |
|---|--------|----------------|
| 01 | **Python Basics** | Syntax & semantics, comments, variables, data types (`int`, `float`, `str`, `bool`), arithmetic/comparison/logical operators |
| 02 | **Control Flow** | `if`/`elif`/`else` conditional statements, `for` and `while` loops, nested conditions |
| 03 | **Data Structures** | Lists (creation, methods, slicing), tuples, sets, dictionaries |
| 04 | **Functions** | Defining functions, arguments (`*args`, `**kwargs`), lambda functions, `map()`, `filter()` |
| 05 | **Modules & Packages** | `import` statement, Python Standard Library (`os`, `sys`, `math`, `datetime`, etc.), creating custom packages and sub-packages |
| 06 | **File Handling** | Reading/writing text files, binary files, file paths (`pathlib`, `os.path`) |
| 07 | **Exception Handling** | `try`/`except`/`else`/`finally`, custom exceptions, raising errors |
| 08 | **Classes & Objects (OOP)** | Classes, inheritance, polymorphism, encapsulation, abstraction, magic (`__dunder__`) methods, operator overloading, custom exceptions |
| 09 | **Advanced Python Concepts** | Iterators (`__iter__`, `__next__`), generators (`yield`), decorators |
| 10 | **Data Analysis with Python** | NumPy (arrays, broadcasting), Pandas (DataFrames, series), data manipulation (`groupby`, `merge`), reading CSV/Excel files |
| 11 | **Logging in Python** | Basic logging (levels, handlers, formatters), multiple loggers, logging to files |
| 12 | **Flask** | Web framework basics, routing (GET/POST), Jinja2 templates, and RESTful APIs (JSON responses, GET/POST/PUT/DELETE) |
| 13 | **MLflow** | Experiment tracking, logging parameters and metrics, and model registry basics |
| 14 | **DVC Demo** | Data Version Control (DVC) basics, dataset versioning, tracking data files (`.dvc`), and data management |
| 15 | **DagsHub Demo** | Data Version Control remote tracking with [DagsHub Repository](https://dagshub.com/DanielGeek/demo-dagshub), DVC S3 storage integration (`dagshub`, `dvc`, `dvc_s3`), and cloud dataset management |
| 16 | **Machine Learning Pipeline** | End-to-end reproducible MLOps pipeline with DVC stages (`preprocess`, `train`, `evaluate`), `dvc.yaml` orchestration, MLflow & [DagsHub Repository](https://dagshub.com/DanielGeek/machine-learning-pipeline) tracking, environment variables (`python-dotenv`), and model artifact versioning |
| 17 | **MLflow on AWS** | Self-hosted MLflow tracking server setup on AWS EC2 backed by AWS S3 (`s3://...`) for artifact storage, IAM security, AWS CLI configuration (`boto3`), and remote experiment tracking |
| 18 | **Docker Hello World** | Docker containerization basics, writing `Dockerfile`, building images (`docker build`), running containers with port mapping (`docker run -p 5001:5001`), and container lifecycle management |
| 19 | **Docker Compose** | Multi-container application orchestration (`docker-compose.yml`), linking Flask web service with Redis cache service, container networking, and volumes |
| 20 | **Airflow with Astronomer (Astro)** | Workflow orchestration and DAG scheduling using Astro CLI, traditional `PythonOperator` with XCom communication, and modern Airflow TaskFlow API (`@task` decorator) |
| 21 | **ETL Pipeline (NASA APOD + Postgres)** | End-to-end ETL pipeline using Apache Airflow + Astro CLI — extracts NASA Astronomy Picture of the Day data from a public API (`HttpOperator`), transforms the JSON response, and loads it into a PostgreSQL database (`PostgresHook`). Dockerized Postgres via `docker-compose.yml` |
| 22 | **GitHub Actions CI/CD + Docker** | Complete CI/CD pipeline with GitHub Actions — automates pytest testing, multi-platform Docker image build (`linux/amd64` + `linux/arm64` via QEMU + Buildx), and publish to Docker Hub. Covers workflow YAML, `needs` job dependencies, repository secrets, and Apple Silicon compatibility. Image: [`danielangelgeek/flasktest-app`](https://hub.docker.com/r/danielangelgeek/flasktest-app) |


---

## Project Structure

```
86-MLOps/
├── 01-python-basics/              # Variables, data types, operators
│   ├── 1.0-basic.ipynb
│   ├── 1.1-Variables.ipynb
│   ├── 1.2-Datatypes.ipynb
│   ├── 1.3-operators.ipynb
│   └── test.py
├── 02-control-flow/               # Conditionals & loops
│   ├── 2.0-Conditionalstatements.ipynb
│   └── 2.1-Loops.ipynb
├── 03-data-structures/            # Lists, tuples, sets, dicts
│   ├── 3.1-Lists.ipynb
│   ├── 3.1.1-ListExamples.ipynb
│   ├── 3.2-Tuples.ipynb
│   ├── 3.3-Sets.ipynb
│   └── 3.4-Dictionaries.ipynb
├── 04-functions/                  # Functions, lambda, map, filter
│   ├── 4.1-functions.ipynb
│   ├── 4.2-examplesfunctions.ipynb
│   ├── 4.3-Lambda.ipynb
│   ├── 4.4-Mapsfunction.ipynb
│   ├── 4.5-filterfunction.ipynb
│   └── sample.txt
├── 05-modules/                    # Imports, stdlib, custom packages
│   ├── 5.1-import.ipynb
│   ├── 5.2-Standardlibrary.ipynb
│   ├── package/
│   │   ├── __init__.py
│   │   ├── maths.py
│   │   └── subpackages/
│   │       ├── __init__.py
│   │       └── mult.py
│   ├── test.py
│   ├── example.csv
│   ├── source.txt
│   └── destination.txt
├── 06-file-handling/              # File I/O, paths
│   ├── 6.1-fileoperation.ipynb
│   ├── 6.2-filepath.ipynb
│   ├── example.txt
│   ├── example.bin
│   ├── destination.txt
│   └── package/
├── 07-exception-handling/         # Try/except, custom exceptions
│   ├── 7.1-exception.ipynb
│   └── example1.txt
├── 08-class-and-objects/          # OOP: inheritance, polymorphism, etc.
│   ├── 8.1-oops.ipynb
│   ├── 8.2-inheritance.ipynb
│   ├── 8.3-polymorphism.ipynb
│   ├── 8.4-encapsulation.ipynb
│   ├── 8.5-abstraction.ipynb
│   ├── 8.6-magicmethods.ipynb
│   ├── 8.7-operator-overloading.ipynb
│   └── 8.8-customexception.ipynb
├── 09-advance-python-concepts/    # Iterators, generators, decorators
│   ├── 9.1-Iterators.ipynb
│   ├── 9.2-generators.ipynb
│   ├── 9.3-decorators.ipynb
│   └── large_file.txt
├── 10-data-analysis-with-python/  # NumPy, Pandas
│   ├── 10.1-numpy.ipynb
│   ├── 10.2-pandas.ipynb
│   ├── 10.3-datamanipulation.ipynb
│   ├── 10.4-readdata.ipynb
│   ├── data.csv
│   ├── sales_data.csv
│   ├── wine.csv
│   └── sample_data.xlsx
├── 11-logging-in-python/          # Logging fundamentals
│   ├── 11.1-logging.ipynb
│   ├── 11.2-multiplelogger.ipynb
│   ├── app.py
│   ├── app.log
│   ├── app1.log
│   └── logs/
│       ├── app.log
│       ├── logger.py
│       └── test.py
├── 12-flask/                      # Web development with Flask
│   ├── app.py                     # Minimal Flask app
│   ├── main.py                    # Flask app with standard HTML templates
│   ├── get_post.py                # Handling GET and POST request parameters
│   ├── jinja.py                   # Dynamic URL building and Jinja2 rendering (conditions, loops)
│   ├── api.py                     # RESTful API with full CRUD endpoints (GET/POST/PUT/DELETE)
│   ├── sample.json                # JSON mock data for API testing
│   └── templates/                 # HTML templates
│       ├── index.html             # Homepage template
│       ├── about.html             # About page template
│       ├── form.html              # Basic HTML form
│       ├── result.html            # Condition-based grade display
│       ├── sucessres.html         # Loop-based grade dictionary display
│       └── getresult.html         # Form for inputting marks (accessibility optimized)
├── 13-mlflow/                     # Experiment tracking with MLflow
│   ├── get-started.ipynb          # Introduction to MLflow tracking
│   ├── 01-project/                # Hyperparameter tuning project
│   │   └── housepricepredict.ipynb # RandomForest regression tracking
│   ├── 02-project/                # Deep Learning with MLflow
│   │   └── starter.ipynb          # Keras/TensorFlow model tracking & optimization
│   └── requirements.txt           # MLflow-specific dependencies
├── 14-dvc-demo/                   # Data Version Control (DVC) demo
│   ├── data/                      # Tracked dataset directory
│   │   ├── data.txt               # Sample dataset file
│   │   └── data.txt.dvc           # DVC tracking metadata file
│   ├── .dvc/                      # DVC system files and configuration
│   ├── requirements.txt           # DVC dependencies
│   └── README.md                  # Module 14 documentation
├── 15-dagshub-demo/               # DagsHub integration demo
│   ├── data/                      # Tracked dataset directory
│   │   ├── data.csv               # Sample CSV dataset file
│   │   └── data.csv.dvc           # DVC tracking metadata file
│   ├── .dvc/                      # DVC configuration (remote DagsHub S3 storage)
│   │   └── config                 # DagsHub S3 endpoint configuration
│   ├── requirements.txt           # DagsHub & DVC S3 dependencies
│   └── README.md                  # Module 15 documentation
├── 16-machine-learning-pipeline/   # End-to-End MLOps Pipeline with DVC & MLflow
│   ├── data/                      # Dataset directory (raw & processed data)
│   │   ├── raw/                   # Raw input dataset
│   │   └── processed/             # Processed dataset generated by DVC stage
│   ├── src/                       # Pipeline stage Python scripts
│   │   ├── preprocess.py          # Data preprocessing script
│   │   ├── train.py               # Model training & hyperparameter tuning with MLflow tracking
│   │   └── evaluate.py             # Model evaluation & metrics logging script
│   ├── models/                    # Trained model binary artifacts (`model.pkl`)
│   ├── .dvc/                      # DVC configuration & cache
│   ├── dvc.yaml                   # DVC pipeline stages definition (`preprocess`, `train`, `evaluate`)
│   ├── dvc.lock                   # DVC pipeline reproducible lock state
│   ├── params.yaml                # Centralized hyperparameters & data path parameters
│   ├── .env.example               # Environment variables template (`MLFLOW_TRACKING_PASSWORD`, etc.)
│   ├── requirements.txt           # Pipeline dependencies (`dvc`, `dagshub`, `mlflow`, `scikit-learn`, `python-dotenv`)
│   └── README.md                  # Module 16 documentation
├── 17-mlflow-aws/                 # Self-hosted MLflow Server on AWS EC2 & S3
│   ├── app.py                     # ElasticNet training script with remote AWS EC2 tracking
│   ├── requirements.txt           # AWS & MLflow dependencies (`mlflow`, `scikit-learn`, `boto3`)
│   └── README.md                  # Module 17 documentation & AWS EC2 setup guide
├── 18-docker-hello-world/         # Docker Containerization Basics
│   ├── app.py                     # Minimal Flask web app listening on port 5001
│   ├── Dockerfile                 # Container image build configuration
│   ├── requirements.txt           # Flask dependency
│   └── README.md                  # Module 18 documentation & Docker commands
├── 19-docker-compose/             # Multi-Container Orchestration
│   ├── app.py                     # Flask web app with Redis hit counter
│   ├── Dockerfile                 # Web app image definition
│   ├── docker-compose.yml         # Compose configuration linking web & Redis services
│   ├── requirements.txt           # Flask & Redis dependencies
│   └── README.md                  # Module 19 documentation & Compose commands
├── 20-airflow-astro/              # Workflow Orchestration with Apache Airflow & Astro CLI
│   ├── dags/                      # Airflow DAGs folder
│   │   ├── exampledag.py          # Example DAG with Open Notify astronauts API
│   │   ├── mlpipeline.py          # Multi-stage ML pipeline (preprocess -> train -> evaluate)
│   │   ├── maths_operation.py     # Mathematical operations using PythonOperator and XComs
│   │   └── taskflowapi.py         # Mathematical sequence DAG using modern TaskFlow API (@task)
│   ├── Dockerfile                 # Astro Runtime Docker image
│   ├── packages.txt               # OS-level packages
│   ├── requirements.txt           # Python dependencies
│   └── README.md                  # Module 20 documentation & Astro CLI reference
├── 21-ETL-pipeline/               # ETL Pipeline — NASA APOD API → Airflow → Postgres
│   ├── dags/
│   │   └── etl.py                 # DAG: create_table → extract_apod → transform → load_data
│   ├── docker-compose.yml         # Postgres 13 container for local data persistence
│   ├── requirements.txt           # providers: apache-airflow-providers-http/postgres
│   ├── airflow_settings.yaml      # Local Airflow connections/pools/variables config
│   ├── Dockerfile                 # Astro Runtime image
│   └── README.md                  # Module 21 documentation
├── 22-github-action-docker/       # GitHub Actions CI/CD + Docker — Flask app published to Docker Hub
│   └── README.md                  # Module 22 documentation & CI/CD reference
├── requirements.txt               # Project-wide Python dependencies
└── README.md                      # This file
```

---

## Setup

### Prerequisites

- Python 3.12+
- `venv` (standard Python virtual environment) or Conda package manager
- Git

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd 86-MLOps

# Option A: Create standard venv environment (Recommended)
python -m venv venv
source venv/bin/activate   # macOS/Linux
# venv\Scripts\activate    # Windows

# Option B: Create conda environment
conda create -n mlops-env python=3.12
conda activate mlops-env

# Install dependencies using the active Python environment
python -m pip install -r requirements.txt
```

### Installation for Module 13 (MLflow)

Module 13 (`13-mlflow`) can be set up in a dedicated environment (Python 3.10) or your existing Anaconda/Conda environment.

#### Option A: Dedicated Local Environment (Recommended)

```bash
# Navigate to the module directory
cd 13-mlflow

# Create and activate environment using Conda
conda create -p venv python=3.10 -y
conda activate ./venv

# Install MLflow dependencies and Jupyter kernel support
python -m pip install -r requirements.txt
python -m pip install ipykernel

# For MLflow >= 2.10 the UI command changed.
# Use the following to start the tracking UI:
#   uvx mlflow server
# (Older versions may still support `mlflow ui`.)
```

#### Option B: Global Anaconda/Conda Environment

If you prefer to use your main `anaconda3` environment:

```bash
# Activate your base conda environment
conda activate

# Install MLflow and its dependencies
python -m pip install -r 13-mlflow/requirements.txt
```

> [!IMPORTANT]
> **VS Code Jupyter Kernel Warning:** When opening `get-started.ipynb`, make sure to select the correct Python kernel in the top-right corner of the editor. If you chose Option A, select the environment pointing to `13-mlflow/venv`. If you chose Option B, select `anaconda3 (Python 3.13.x)`. Otherwise, you will encounter a `ModuleNotFoundError: No module named 'mlflow'` error.

### Installation for Module 14 (DVC Demo)

Module 14 (`14-dvc-demo`) uses Data Version Control (DVC) to manage data files and versioning:

```bash
# Navigate to module directory
cd 14-dvc-demo

# Create and activate environment using Conda (Python 3.9)
conda create -p venv python=3.9 -c conda-forge -y
conda activate ./venv

# Install DVC dependencies
python -m pip install -r requirements.txt
```

### Installation for Module 15 (DagsHub Demo)

Module 15 (`15-dagshub-demo`) integrates DVC with [DagsHub](https://dagshub.com/DanielGeek/demo-dagshub) for cloud data versioning and remote S3 storage tracking:

```bash
# Navigate to module directory
cd 15-dagshub-demo

# Create and activate environment using Conda (Python 3.9)
conda create -p venv python=3.9 -c conda-forge -y
conda activate ./venv

# Install DagsHub and DVC S3 dependencies
python -m pip install -r requirements.txt
```

### Installation for Module 16 (Machine Learning Pipeline)

Module 16 (`16-machine-learning-pipeline`) is a complete, reproducible MLOps pipeline built with DVC pipeline stages, MLflow experiment tracking, Scikit-learn, and [DagsHub Repository](https://dagshub.com/DanielGeek/machine-learning-pipeline) remote tracking:

```bash
# Navigate to module directory
cd 16-machine-learning-pipeline

# Create and activate environment using Conda (Python 3.10)
conda create -p venv python=3.10 -c conda-forge -y
conda activate ./venv

# Install pipeline dependencies
python -m pip install -r requirements.txt

# Copy environment variables template and set credentials
cp .env.example .env

# Execute reproducible pipeline
dvc repro
```

### Installation for Module 17 (MLflow on AWS)

Module 17 (`17-mlflow-aws`) demonstrates self-hosting an MLflow tracking server on an AWS EC2 instance backed by AWS S3 for artifact storage:

```bash
# Navigate to module directory
cd 17-mlflow-aws

# Create and activate environment using Conda (Python 3.10)
conda create -p venv python=3.10 -c conda-forge -y
conda activate ./venv

# Install AWS & MLflow dependencies
python -m pip install -r requirements.txt

# Configure AWS CLI credentials
aws configure

# Execute training script with remote AWS MLflow tracking
python app.py 0.6 0.4
```


### Installation for Module 18 (Docker Hello World)

Module 18 (`18-docker-hello-world`) demonstrates containerizing a Flask web application with Docker:

```bash
# Navigate to module directory
cd 18-docker-hello-world

# Build Docker image
docker build -t welcome-app .

# Run container with port mapping
docker run -p 5001:5001 welcome-app
```

### Installation for Module 19 (Docker Compose)

Module 19 (`19-docker-compose`) orchestrates multi-container applications (Flask web service + Redis cache):

```bash
# Navigate to module directory
cd 19-docker-compose

# Build and start services in detached mode
docker compose up -d

# Stop services
docker compose down
```

### Installation for Module 20 (Airflow with Astronomer CLI)

Module 20 (`20-airflow-astro`) runs Apache Airflow locally using the Astronomer CLI (`astro`):

```bash
# Navigate to module directory
cd 20-airflow-astro

# Start local Airflow environment (Postgres, Webserver, Scheduler, Triggerer, DAG Processor)
astro dev start

# Validate DAG integrity
astro dev parse

# Stop Airflow environment
astro dev stop
```

### Installation for Module 21 (ETL Pipeline — NASA APOD + Postgres)

Module 21 (`21-ETL-pipeline`) runs an end-to-end ETL pipeline using Apache Airflow (Astro CLI) + PostgreSQL:

```bash
# Navigate to module directory
cd 21-ETL-pipeline

# Start local Airflow with Astro CLI (builds image with providers-http/postgres)
astro dev start

# Validate DAG integrity
astro dev parse

# Restart after changes to requirements.txt or dags/
astro dev restart

# Stop Airflow environment
astro dev stop
```

**Airflow Connections required** (set in Airflow UI at http://21-etl-pipeline.localhost:6563 → Admin → Connections):

| Connection ID | Type | Details |
|---|---|---|
| `nasa_api` | HTTP | Host: `api.nasa.gov`, Extra: `{"api_key": "YOUR_NASA_API_KEY"}` |
| `my_postgres_connection` | Postgres | Host: `postgres`, Port: `5432`, DB: `postgres`, User/Pass: `postgres` |

---


### Installation for Module 22 (GitHub Actions CI/CD + Docker)

Module 22 (`22-github-action-docker`) automates testing, building, and publishing a Dockerized Flask app to Docker Hub using GitHub Actions. The CI/CD pipeline runs automatically on GitHub — no local setup required to trigger it.

**Source repository:** [`github.com/DanielGeek/github-action-docker`](https://github.com/DanielGeek/github-action-docker)  
**Published image:** [`danielangelgeek/flasktest-app`](https://hub.docker.com/r/danielangelgeek/flasktest-app)

```bash
# Clone and run tests locally
git clone https://github.com/DanielGeek/github-action-docker.git
cd github-action-docker

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install flask pytest

# Run tests
pytest

# Pull and run the published Docker image (multi-platform: amd64 + arm64)
docker pull danielangelgeek/flasktest-app
docker run -p 5001:5001 danielangelgeek/flasktest-app
```

**GitHub Secrets required** (Settings → Secrets → Actions):

| Secret | Value |
|---|---|
| `DOCKER_USERNAME` | Your Docker Hub username |
| `DOCKER_PASSWORD` | Your Docker Hub access token |

---


## Running Notebooks & Applications

All notebook modules are built as **Jupyter Notebooks (`.ipynb`)**. Start the notebook server from the project root:

```bash
# Start Jupyter Notebook
jupyter notebook

# Or use Jupyter Lab (recommended for a richer experience)
jupyter lab
```

Navigate to any module folder (e.g., `01-python-basics/`, `08-class-and-objects/`) and open the corresponding `.ipynb` file.

You can also run individual Python scripts, web applications, and orchestrators:

```bash
# Example: run a test script from module 01
python 01-python-basics/test.py

# Example: run the Flask web app from module 12
cd 12-flask
python app.py

# Example: run the MLflow tracking server from module 13
cd 13-mlflow
conda activate ./venv
mlflow ui
# Or alternatively on-the-fly using uvx:
uvx mlflow server

# Example: run multi-container Docker Compose app from module 19
cd 19-docker-compose
docker compose up

# Example: start Apache Airflow with Astronomer from module 20
cd 20-airflow-astro
astro dev start
```

---

## Helpful Commands

### Environment Management

```bash
# Create conda environment
conda create -p venv python==3.12

# Activate
conda activate venv/

# Deactivate
conda deactivate

# Remove environment
conda remove -p venv --all

# Alternative with venv
python -m venv venv
source venv/bin/activate   # macOS/Linux
deactivate
```

### Package Management

```bash
# Install dependencies in the active environment
python -m pip install -r requirements.txt

# Install a specific package
python -m pip install package_name

# List installed packages
python -m pip list

# Freeze current packages to requirements.txt
python -m pip freeze > requirements.txt
```

### Jupyter Notebook Commands

```bash
# Start notebook server
jupyter notebook

# Start Jupyter Lab
jupyter lab

# Convert notebook to Python script
jupyter nbconvert --to python notebook.ipynb

# Convert notebook to HTML
jupyter nbconvert --to html notebook.ipynb
```

### Git Commands

```bash
# Initialize repository
git init

# Add all files to staging
git add .

# Commit changes
git commit -m "Your commit message"

# Push to remote
git push origin main

# Pull latest changes
git pull origin main

# Check status
git status

# View commit history
git log --oneline
```

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `ipykernel` | IPython kernel for Jupyter notebooks |
| `numpy` | Numerical computing (arrays, linear algebra) |
| `pandas` | Data manipulation and analysis (DataFrames) |
| `flask` | Lightweight WSGI web application framework |
| `mlflow` | Experiment tracking and model registry |
| `keras` / `tensorflow` | Deep Learning models and neural network training |
| `hyperopt` | Distributed hyperparameter optimization |
| `dvc` | Data Version Control for data files and ML pipelines |
| `dagshub` | Data Science Collaboration Platform (DVC/MLflow integration) |
| `dvc_s3` | DVC plugin for S3 remote storage compatibility |
| `python-dotenv` | Load environment variables from `.env` files |
| `boto3` | AWS SDK for Python (S3 artifact tracking with MLflow) |
| `redis` | In-memory key-value data store client |
| `apache-airflow` / Astro | Workflow orchestration and data pipeline scheduling |

All dependencies are defined in `requirements.txt`. If you need additional packages (e.g. `openpyxl` for Excel handling), install them using:

```bash
python -m pip install openpyxl
```

---

## Learning Path

This project covers **modules 01–22** within a broader MLOps curriculum:

```
Python Foundations → ML Libraries → MLOps Tooling (DVC, MLflow) → Containerization (Docker, Compose) → Workflow Orchestration (Airflow/Astro) → CI/CD Automation (GitHub Actions)
```

Each module builds on the previous one. By the end, you will have a solid grasp of Python programming, data manipulation, machine learning tracking, containerization, production-ready orchestration pipelines, and automated CI/CD workflows.

---

## License

MIT — This project is part of an MLOps learning path.