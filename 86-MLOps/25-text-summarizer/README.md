# Text Summarizer — End-to-End NLP MLOps Pipeline

Production-oriented **abstractive text summarization** project built with Hugging Face Transformers (Pegasus), a modular training pipeline, and a FastAPI inference service.

The model is fine-tuned on dialogue/summary style data (SAMSum) and exposed through a `/predict` API for real-time summarization.

---

## Overview

This project demonstrates a full MLOps-style NLP workflow:

1. **Data ingestion** — download and extract the dataset  
2. **Data transformation** — tokenize dialogues/summaries for seq2seq training  
3. **Model training** — fine-tune Pegasus with Hugging Face `Trainer`  
4. **Model evaluation** — compute ROUGE metrics  
5. **Prediction API** — FastAPI endpoint for online inference  

Configuration is externalized via `config/config.yaml` and `params.yaml`.

---

## Features

- Modular components under `src/textSummarizer/` (ingestion → transformation → trainer → evaluation → prediction)
- Configuration Manager + typed config entities (`dataclass`)
- Hugging Face `transformers` + `datasets` + `evaluate` (ROUGE)
- Training orchestration via `main.py`
- FastAPI service (`app.py`) with `/train` and `/predict`
- Research notebooks for experimentation (`research/`)

---

## Tech Stack

| Layer | Tools |
| --- | --- |
| Language | Python 3.10 |
| NLP / DL | PyTorch, Hugging Face Transformers, Accelerate |
| Data | datasets, pandas, PyYAML, python-box |
| Metrics | evaluate (ROUGE), sacrebleu, rouge_score |
| API | FastAPI, Uvicorn |
| Research | Jupyter Notebook |

**Base model:** `google/pegasus-cnn_dailymail` (or `google/pegasus-xsum` for lighter local experiments)

---

## Project Structure

```text
25-text-summarizer/
├── app.py                          # FastAPI inference / train triggers
├── main.py                         # Run full training pipeline
├── config/config.yaml              # Paths & artifact locations
├── params.yaml                     # TrainingArguments hyperparameters
├── artifacts/                      # Data, model, tokenizer, metrics
├── research/                       # Notebooks (EDA / stage prototypes)
├── src/textSummarizer/
│   ├── components/                 # Ingestion, transformation, trainer, evaluation
│   ├── config/                     # ConfigurationManager
│   ├── entity/                     # Config dataclasses
│   ├── pipeline/                   # Stage + prediction pipelines
│   ├── utils/                      # YAML, directories, helpers
│   └── logging/                    # Project logger
├── requirements.txt
└── README.md
```

---

## Getting Started

### Prerequisites

- Python **3.10** (recommended; `ensure` is incompatible with 3.13+)
- Enough disk for the Pegasus checkpoint (~2.3 GB PyTorch weights)
- Optional: Apple MPS / CUDA GPU

### Installation

```bash
cd 25-text-summarizer

python3.10 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

pip install -r requirements.txt
```

Using Conda:

```bash
conda create -p venv python=3.10 -y
conda activate ./venv
pip install -r requirements.txt
```

### Download the base model (optional pre-cache)

```bash
# Prefer excluding unused framework weights
hf download google/pegasus-cnn_dailymail --exclude "rust_model.ot"

# Or a lighter alternative for local experiments:
# hf download google/pegasus-xsum --exclude "flax_model.msgpack" --exclude "tf_model.h5" --exclude "tf_weights_dict.pkl"
```

---

## Training

From the project root (with `venv` active):

```bash
python main.py
```

This runs:

1. Data Ingestion  
2. Data Transformation  
3. Model Trainer  
4. Model Evaluation  

Artifacts are written under `artifacts/` (dataset, tokenized data, fine-tuned model, tokenizer, metrics).

Research notebooks live in `research/` (e.g. `1_data_ingestion.ipynb`, `3_model_trainer.ipynb`, `4_model_evaluation.ipynb`). Always run notebooks from the **project root** (or use the notebook cells that resolve `config/config.yaml`).

---

## FastAPI Inference

Start the API:

```bash
python app.py
# or
uvicorn app:app --host 0.0.0.0 --port 8080 --reload
```

Open interactive docs: [http://localhost:8080/docs](http://localhost:8080/docs)

| Endpoint | Method | Description |
| --- | --- | --- |
| `/` | GET | Redirects to `/docs` |
| `/train` | GET | Triggers `python main.py` |
| `/predict` | POST | Summarizes query param `text` |

Example:

```bash
curl -X POST "http://localhost:8080/predict?text=Amanda:%20I%20baked%20cookies.%20Do%20you%20want%20some%3F%20Jerry:%20Sure!"
```

> Use a longer dialogue/article for meaningful summaries. Very short prompts often produce copy/repetition, especially with light fine-tuning.

---

## Configuration

Key paths in `config/config.yaml`:

| Key | Purpose |
| --- | --- |
| `model_trainer.model_ckpt` | Base HF model id |
| `model_evaluation.model_path` | Fine-tuned model dir |
| `model_evaluation.tokenizer_path` | Saved tokenizer dir |

Training hyperparameters live in `params.yaml` under `TrainingArguments`.

---

## Notes

- Prefer **Python 3.10** for this repo.
- On transformers **v5**, use `eval_strategy` (not `evaluation_strategy`) and `processing_class` (not `tokenizer`) in `Trainer` APIs; the `summarization` pipeline task was removed — prediction uses `model.generate()`.
- Pegasus positional embeddings support **max length 512** for inputs.

---

## License

Educational / portfolio project as part of the `86-MLOps` learning path.
