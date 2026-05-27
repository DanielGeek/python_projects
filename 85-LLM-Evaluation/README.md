# RAG Evaluation with Ragas

This repository contains automated tests to evaluate Retrieval-Augmented Generation (RAG) pipelines using the **Ragas** framework.

It focuses on two key metrics:

---

## 📌 Metrics Explained

### 1. Context Recall

Measures how complete the retrieved context is.

> “Did we retrieve all the necessary information to answer the question correctly?”

- High recall → important information is not missing
- Low recall → missing critical context chunks

---

### 2. Context Precision (Without Reference)

Measures how relevant the retrieved documents are.

> “How much of the retrieved context is actually useful?”

- High precision → mostly relevant chunks
- Low precision → noisy or irrelevant chunks included

---

## 🧪 Project Structure

- `tests/test_context_recall.py` → evaluates retrieval completeness
- `tests/test_context_precision.py` → evaluates retrieval relevance
- `helpers/clean_chat_completions.py` → custom OpenAI wrapper

---

## ⚙️ Setup

### 1. Install dependencies

```bash
uv sync
```

---

### 2. Set environment variables

Create a `.env` file:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.4-nano
```

---

## 🚀 Run Tests

### Run all tests

```bash
uv run pytest
```

---

### Run Context Recall test

```bash
uv run pytest tests/test_context_recall.py -s
```

---

### Run Context Precision test

```bash
uv run pytest tests/test_context_precision.py -s
```

---

## 📡 Data Source

This project uses a sample RAG API:

```
https://rahulshettyacademy.com/rag-llm/ask
```

It returns:
- `answer`
- `retrieved_docs` (used as retrieval context)

---

## 🧠 Key Idea

The goal is to evaluate how good your retrieval system is before blaming the LLM.

Good RAG systems require:

- High Context Recall → nothing important is missing
- High Context Precision → minimal noise in retrieved chunks

---

## 🧪 Example Workflow

1. Send question to RAG API
2. Collect retrieved documents
3. Build `SingleTurnSample`
4. Run Ragas metric
5. Validate score threshold (e.g. ≥ 0.8)

---

## 📈 Expected Outcome

A well-tuned RAG system should achieve:

- Context Recall ≥ 0.8
- Context Precision ≥ 0.7–0.9 depending on dataset

---

## 🛠 Tech Stack

- Python 3.11+
- pytest
- httpx
- Ragas
- OpenAI API
- uv package manager

---

## 📌 Example Command

```bash
uv run pytest tests/test_context_recall.py -s
```

This runs the test in verbose mode and prints metric scores in real time.
