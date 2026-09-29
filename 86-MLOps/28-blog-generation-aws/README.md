# Blog Generation with AWS Bedrock

Serverless-style **blog generation** using **Amazon Bedrock** (Meta Llama 2 chat) and **S3** for output storage. The entry point is a Lambda-compatible handler that takes a `blog_topic`, invokes Bedrock, and writes the generated text to an S3 bucket.

---

## Overview

1. **Request** — `lambda_handler` receives JSON with `blog_topic`
2. **Generate** — `bedrock-runtime` `invoke_model` with Llama 2 prompt (~200 words)
3. **Persist** — upload the blog body to S3 under `blog-output/<HHMMSS>.txt`
4. **Respond** — return HTTP-style `statusCode` / `body` for API Gateway or local tests

---

## Tech Stack

| Layer    | Tools                                            |
| ----------| --------------------------------------------------|
| Language | Python 3.10                                      |
| AWS      | boto3 (`bedrock-runtime`, S3)                    |
| LLM      | Amazon Bedrock — `meta.llama2-13b-chat-v1`       |
| Runtime  | AWS Lambda–compatible handler (`lambda_handler`) |

---

## Project Structure

```text
28-blog-generation-aws/
├── app.py                 # Bedrock generate + S3 save + lambda_handler
├── requirements.txt       # boto3
└── README.md
```

---

## Setup

### Prerequisites

- Python **3.10**
- AWS account with:
  - Bedrock model access enabled for Llama 2 in your region (default in code: `us-east-1`)
  - S3 bucket for outputs (default in code: `aws_bedrock_course1`)
  - IAM permissions: `bedrock:InvokeModel`, `s3:PutObject`
- Local AWS credentials (`aws configure` or env vars)

### Installation

```bash
cd 28-blog-generation-aws

conda create -p venv python==3.10 -y
conda activate ./venv
pip install -r requirements.txt
```

---

## How it works

| Function | Role |
| --- | --- |
| `blog_generate_using_bedrock(topic)` | Builds a Llama 2 `[INST]` prompt and calls Bedrock |
| `save_blog_details_s3(key, bucket, text)` | `put_object` to S3 |
| `lambda_handler(event, context)` | Parses event, generates, uploads, returns status |

Default Bedrock settings in code:

- **Region:** `us-east-1`
- **Model:** `meta.llama2-13b-chat-v1`
- **Params:** `max_gen_len=512`, `temperature=0.5`, `top_p=0.9`
- **S3 key pattern:** `blog-output/<HHMMSS>.txt`

---

## Run / test locally

Invoke the handler with a JSON string event (same shape Lambda would receive):

```python
import json
from app import lambda_handler

event = json.dumps({"blog_topic": "MLOps on AWS"})
print(lambda_handler(event, None))
```

Or from the shell (with venv active and AWS credentials set):

```bash
python -c 'import json; from app import lambda_handler; print(lambda_handler(json.dumps({"blog_topic": "MLOps on AWS"}), None))'
```

### Deploy notes (AWS)

Typical course path:

1. Create / reuse an S3 bucket and update `s3_bucket` in `app.py` if needed  
2. Enable Bedrock model access for Llama 2 in the target region  
3. Package `app.py` (+ deps if not using a Lambda layer) and deploy as a Lambda function  
4. Attach an IAM role with Bedrock + S3 permissions  
5. Optional: API Gateway → Lambda with body `{"blog_topic": "..."}`  

---

## Notes

- Ensure the Bedrock model ID is available in your account/region; model names can change as AWS updates catalog offerings.
- The handler expects `event` as a **JSON string** (`json.loads(event)`); if you wire API Gateway proxy integration, you may need to adapt parsing to `event["body"]`.
