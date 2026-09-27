# AWS SageMaker — Mobile Price Classification

End-to-end **managed ML training on Amazon SageMaker** using the **SageMaker Python SDK v3** (`ModelTrainer`). The project trains a scikit-learn Random Forest on a mobile phone price-range dataset, stores data and model artifacts in S3, and walks through job launch, artifact retrieval, and endpoint cleanup in a research notebook.

---

## Overview

1. **EDA & split** — load CSV, train/test split (85/15), export `train-V-1.csv` / `test-V-1.csv`
2. **S3 upload** — push datasets to an S3 prefix with `Session.upload_data`
3. **Training script** — `script.py` (RandomForest + metrics; SageMaker channels `SM_CHANNEL_TRAIN` / `SM_CHANNEL_TEST`)
4. **Managed training** — `ModelTrainer` with scikit-learn container image (`0.23-1`), spot instances, hyperparameters
5. **Artifacts** — read `s3_model_artifacts` from the completed training job
6. **Endpoint** — deploy / predict / delete endpoint (notebook cells)

---

## Tech Stack

| Layer | Tools |
| --- | --- |
| Language | Python 3.10 |
| Cloud ML | Amazon SageMaker Python SDK **v3** (`ModelTrainer`) |
| AWS | boto3, S3, IAM execution role |
| ML | scikit-learn (RandomForestClassifier) |
| Config | `python-dotenv` (`.env`) |
| Research | Jupyter (`research.ipynb`) |

---

## Project Structure

```text
26-AWS-Sagemaker/
├── research.ipynb                      # Full walkthrough notebook
├── script.py                           # SageMaker training entry script
├── mob_price_classification_train.csv  # Raw dataset
├── train-V-1.csv / test-V-1.csv        # Split datasets (generated)
├── .env.example                        # Region, bucket, IAM role template
├── requirements.txt
└── README.md
```

---

## Setup

### Prerequisites

- Python **3.10**
- AWS account with:
  - IAM role trusted by SageMaker (training + S3 access)
  - S3 bucket for data/artifacts
  - Local credentials (`aws configure` or env vars)
- Conda or venv

### Installation

```bash
cd 26-AWS-Sagemaker

conda create -p venv python==3.10 -y
conda activate ./venv
pip install -r requirements.txt

cp .env.example .env
# Edit .env: AWS region, S3 bucket name, SAGEMAKER_ROLE ARN
```

### Environment variables

| Variable | Purpose |
| --- | --- |
| `AWS_DEFAULT_REGION` / `AWS_REGION` | AWS region (e.g. `us-east-1`) |
| `MOB_BUCKET_SAGEMAKER` | S3 bucket for data and artifacts |
| `SAGEMAKER_ROLE` | IAM role ARN for SageMaker jobs |

The notebook loads `.env` with `load_dotenv()` before creating boto3 / SageMaker sessions.

---

## SageMaker SDK v3 notes

This project uses **SDK v3** (not the older `SKLearn` estimator):

| v2 | v3 |
| --- | --- |
| `sagemaker.sklearn.estimator.SKLearn` | `sagemaker.train.ModelTrainer` |
| `entry_point=...` | `SourceCode(entry_script=...)` |
| `instance_type` / spot flags | `Compute(...)` |
| `max_run` / `max_wait` | `StoppingCondition(...)` |
| `estimator.fit({"train": ..., "test": ...})` | `trainer.train(input_data_config=[InputData(...), ...])` |
| `estimator.latest_training_job` | `trainer._latest_training_job` |

Docs: [ModelTrainer](https://sagemaker.readthedocs.io/en/stable/api/generated/sagemaker.train.model_trainer.html) · [Migration guide](https://github.com/aws/sagemaker-python-sdk/blob/master/migration.md)

---

## Run

```bash
conda activate ./venv
# Open research.ipynb and select the venv kernel
# Run cells in order: session → data → upload → ModelTrainer → train → artifacts
```

Or step through in VS Code / Cursor Jupyter.

---

## Dataset

Mobile price classification features (battery, RAM, camera, etc.) with target `price_range` (multi-class). Source file: `mob_price_classification_train.csv`.
