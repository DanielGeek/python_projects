# AWS SageMaker — Hugging Face LLM & NLP Inference

Hands-on labs for **deploying Hugging Face models on Amazon SageMaker Inference**: a large language model (**Falcon-40B-Instruct**) via the Hugging Face LLM Deep Learning Container (TGI), and a smaller **question-answering** model (**DistilBERT SQuAD**) via the standard `HuggingFaceModel` estimator/deploy flow.

Intended to run in **SageMaker Studio / Notebook** (or any environment with SageMaker permissions and GPU quota for Lab 1).

---

## Overview

| Lab | Notebook | Model | Instance | Goal |
| --- | --- | --- | --- | --- |
| **1 (b)** | `falcon40B-instruct-notebook-full.ipynb` | `tiiuae/falcon-40b-instruct` | `ml.g5.12xlarge` (4× A10G) | Deploy LLM with HF LLM DLC + TGI; chat, prompt engineering, few-shot |
| **2** | `lab2.ipynb` | `distilbert-base-uncased-distilled-squad` | `ml.m5.xlarge` | Deploy Transformers QA task; run `predictor.predict` |

---

## Lab 1 — Falcon-40B-Instruct on SageMaker

1. Upgrade `boto3` / `sagemaker` and resolve execution role + default S3 bucket  
2. Resolve Hugging Face LLM image URI (`get_huggingface_llm_image_uri`, TGI backend)  
3. Create `HuggingFaceModel` with env: `HF_MODEL_ID`, `SM_NUM_GPUS`, token limits  
4. `deploy()` to a real-time endpoint  
5. Run inference payloads (`inputs` + generation `parameters`)  
6. Prompt engineering: unstructured vs structured context/Q&A  
7. One-shot / few-shot sentiment examples  
8. Cleanup: `delete_model()` + `delete_endpoint()`  

**Key config (from notebook):**

- Image helper version: `0.8.2`  
- GPUs: `4` (`SM_NUM_GPUS`)  
- `MAX_INPUT_LENGTH`: 1024 · `MAX_TOTAL_TOKENS`: 2048  
- Optional quantize: `HF_MODEL_QUANTIZE=bitsandbytes` (commented)  

---

## Lab 2 — DistilBERT Question Answering

1. Session + IAM role setup (same pattern as Lab 1)  
2. `HuggingFaceModel` with Hub env:
   - `HF_MODEL_ID=distilbert-base-uncased-distilled-squad`
   - `HF_TASK=question-answering`
3. Framework stack: Transformers `4.26` · PyTorch `1.13` · Python `py39`  
4. Deploy on `ml.m5.xlarge`  
5. Predict with `{"inputs": {"question": "...", "context": "..."}}`  

---

## Tech Stack

| Layer | Tools |
| --- | --- |
| Language | Python 3.x (SageMaker notebook kernel) |
| Cloud ML | Amazon SageMaker Python SDK, boto3 |
| Models | Hugging Face Hub (Falcon-40B-Instruct, DistilBERT SQuAD) |
| Serving | Hugging Face LLM DLC + Text Generation Inference (Lab 1); HF Inference Toolkit (Lab 2) |
| Hardware | GPU `ml.g5.12xlarge` (Lab 1) · CPU `ml.m5.xlarge` (Lab 2) |

---

## Project Structure

```text
29-aws-sagemaker/
├── falcon40B-instruct-notebook-full.ipynb   # Lab 1 — Falcon-40B-Instruct + TGI
├── lab2.ipynb                               # Lab 2 — DistilBERT QA endpoint
├── .gitignore
└── README.md
```

---

## Prerequisites

- AWS account with SageMaker access  
- IAM execution role trusted by SageMaker (Studio role or `sagemaker_execution_role`)  
- Service quotas / capacity for:
  - **Lab 1:** `ml.g5.12xlarge` (expensive — stop/delete endpoint when done)
  - **Lab 2:** `ml.m5.xlarge`  
- Prefer running inside **SageMaker Studio** so `sagemaker.get_execution_role()` works without extra IAM lookups  

---

## Setup & run

Open the notebooks in SageMaker Studio (or a local Jupyter with AWS credentials configured) and run cells top to bottom.

```bash
# Optional: clone / open this folder in Studio
cd 29-aws-sagemaker

# Lab 1
# → falcon40B-instruct-notebook-full.ipynb

# Lab 2
# → lab2.ipynb
```

Dependencies are installed in-notebook (`!pip install --upgrade boto3 sagemaker`).

---

## Cost & cleanup

Lab 1 keeps a large GPU endpoint running until deleted. Always finish with:

```python
llm.delete_model()
llm.delete_endpoint()
```

For Lab 2:

```python
predictor.delete_model()
predictor.delete_endpoint()
```

---

## Notes

- Falcon-40B sharding across GPUs is handled by **TGI** inside the Hugging Face LLM container.  
- Generation parameters used in Lab 1 include `temperature`, `top_p`, `max_new_tokens`, `repetition_penalty`, and `stop` sequences.  
- Compared to module `26-AWS-Sagemaker` (tabular sklearn training with SDK v3 `ModelTrainer`), this module focuses on **HF inference endpoints** for LLMs and classic NLP tasks.
