# 85-LLM-Evaluation

A **RAG (Retrieval-Augmented Generation) evaluation framework** using **Ragas v0.4.3** to measure the quality of LLM-generated responses against retrieved contexts.

This project evaluates a RAG system built on top of a **Selenium WebDriver Python course** dataset, calling an external API at `https://rahulshettyacademy.com/rag-llm/ask` to obtain actual LLM responses and retrieved documents.

---

## Table of Contents

- [Metrics](#metrics)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Test Data Format](#test-data-format)
- [Key Technical Findings](#key-technical-findings)
- [Dependencies](#dependencies)

---

## Metrics

| Metric | File | What It Measures | Required Fields |
|--------|------|------------------|-----------------|
| **Faithfulness** | `test_faithfulness.py` | Whether the response is factually grounded in the retrieved context (no hallucinations) | `user_input`, `response`, `retrieved_contexts` |
| **Context Precision** | `test_context_precision.py` | Whether the retrieved documents are relevant to the user's query | `user_input`, `response`, `retrieved_contexts` |
| **Context Recall** | `test_context_recall.py` | Whether the retrieved context contains all necessary information to answer the query | `user_input`, `retrieved_contexts`, `reference` |
| **AnswerRelevancy** | `test_relevancy_factual.py` | Whether the response is relevant to the question asked | `user_input`, `response` |
| **FactualCorrectness** | `test_relevancy_factual.py` | Whether the claims in the response match the reference (ground truth) | `response`, `reference` |
| **TopicAdherence** | `test_topic_adherence.py` | Whether the AI's response stays within predefined allowed topics | `conversation`, `reference_topics` |

### Metric Score Ranges

All metrics produce scores between **0.0 and 1.0**:
- **≥ 0.9** – Excellent
- **≥ 0.8** – Good
- **≥ 0.6** – Acceptable
- **< 0.6** – Needs improvement

---

## Project Structure

```
85-LLM-Evaluation/
├── helpers/
│   ├── __init__.py
│   ├── chat_completions.py      # OpenAI client wrapper (strips max_tokens)
│   └── llm_response.py          # Loads test data + calls external RAG API
├── test_data/
│   ├── data.json                # Legacy sample data
│   ├── faithfulness/
│   │   └── selenium_faithfulness.json
│   ├── precision/
│   │   └── selenium_precision.json
│   ├── recall/
│   │   └── selenium_recall.json
│   ├── relevancy_factual/
│   │   └── selenium_relevancy_factual.json
│   └── topic_adherence/
│       └── selenium_topic_adherence.json
├── tests/
│   ├── __init__.py
│   ├── conftest.py              # Pytest fixtures (LLM, embeddings, data loader)
│   ├── test_faithfulness.py
│   ├── test_context_precision.py
│   ├── test_context_recall.py
│   ├── test_relevancy_factual.py
│   └── test_topic_adherence.py
├── postman/
│   └── RAG_COURSE.postman_collection.json
├── .env.example
├── .gitignore
├── .python-version
├── pyproject.toml
├── pytest.ini
├── README.md
└── uv.lock
```

---

## Setup

### Prerequisites

- Python 3.11+
- [uv](https://docs.astral.sh/uv/) (fast Python package installer)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd 85-LLM-Evaluation

# Create virtual environment and install dependencies
uv sync

# Activate the environment
source .venv/bin/activate  # macOS/Linux
# or
.venv\Scripts\activate  # Windows
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | `sk-proj-...` |
| `OPENAI_MODEL` | LLM model for evaluation | `gpt-5.4-nano` |
| `OPENAI_EMBEDDING_MODEL` | Embedding model | `text-embedding-3-small` |

---

## Running Tests

Run all tests:

```bash
uv run pytest tests/ -v
```

Run a specific test:

```bash
uv run pytest tests/test_faithfulness.py -v
```

Run tests with detailed output:

```bash
uv run pytest tests/ -v -s
```

### Test Fixtures

Defined in `tests/conftest.py`:

| Fixture | Type | Description |
|---------|------|-------------|
| `ragas_llm` | `pytest.fixture` | Instructor-based LLM (OpenAI) for metric scoring |
| `ragas_embedding` | `pytest.fixture` | OpenAI embedding model for semantic similarity |
| `get_data` | `pytest_asyncio.fixture` | Async parametrized fixture that loads test data from JSON + calls the external RAG API |
| `TestSample` | Class | Wraps `SingleTurnSample` with extra fields (`conversation`, `reference_topics`) |

The `get_data` fixture returns a `TestSample` object that exposes:
- `user_input` – The original question
- `response` – The LLM-generated answer
- `retrieved_contexts` – Documents retrieved from the vector store
- `reference` – Ground truth string (falls back to `reference_topics` joined as string if not present)
- `conversation` – `[HumanMessage, AIMessage]` pair (for TopicAdherence)
- `reference_topics` – List of allowed topics (for TopicAdherence)

---

## Test Data Format

Each JSON file in `test_data/` contains an array of test samples:

### Faithfulness / Context Precision / Context Recall

```json
[
  {
    "question": "How many articles are there in the Selenium WebDriver Python course?",
    "answer": "There are 23 articles in the course.",
    "retrieved_contexts": [
      "Document content 1",
      "Document content 2"
    ],
    "reference": "Ground truth string (optional for Faithfulness, required for Recall)"
  }
]
```

### Relevancy + FactualCorrectness

```json
[
  {
    "question": "How many articles are there in the Selenium WebDriver Python course?",
    "answer": "There are 23 articles in the course.",
    "retrieved_contexts": [
      "Document content 1"
    ],
    "reference": "23 articles are included in the course."
  }
]
```

### TopicAdherence

```json
[
  {
    "question": "How many articles are there in the Selenium WebDriver Python course?",
    "answer": "There are 23 articles in the course.",
    "retrieved_contexts": [
      "Document content 1"
    ],
    "reference_topics": ["Selenium WebDriver", "Python", "Course Content"]
  }
]
```

> **Note:** When `reference_topics` is used instead of `reference`, the fixture automatically handles the conversion. `SingleTurnSample.reference` gets the joined string, while `TestSample.reference_topics` preserves the original list.

---

## Key Technical Findings

### NaN Scores with `evaluate()`

**Problem:** `AnswerRelevancy` and `FactualCorrectness` from `ragas.metrics.collections` inherit from `SimpleBaseMetric`, **NOT** from the old `Metric` class. The `evaluate()` function uses `isinstance(m, Metric)` for validation, which rejects these new metrics and silently returns `NaN` scores.

**Solution:** Use `ascore()` directly instead of `evaluate()`:

```python
# ❌ Returns NaN
results = evaluate(dataset=ds, metrics=[AnswerRelevancy(...)])

# ✅ Returns correct scores
score = await AnswerRelevancy(llm=llm, embeddings=emb).ascore(
    user_input=question,
    response=answer,
)
```

### FactualCorrectness Parameters

`FactualCorrectness.ascore()` only accepts `(response, reference)` – no `user_input`:

```python
# ✅ Correct
await factual_correctness.ascore(response=resp, reference=ref)

# ❌ Will not work
await factual_correctness.ascore(user_input=question, response=resp, reference=ref)
```

### External API Variability

The RAG API at `rahulshettyacademy.com` returns slightly different responses on each call. This causes minor score fluctuations across runs, especially for `FactualCorrectness` in `f1` mode. Using `precision` mode yields more consistent results.

### Deprecation Warnings

Import `embedding_factory` from the new path to avoid warnings:

```python
# ✅ Modern import
from ragas.embeddings.base import embedding_factory

# ❌ Deprecated
from ragas.embeddings import embedding_factory
```

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `ragas` | ≥0.4.3 | RAG evaluation framework |
| `openai` | latest | OpenAI API client |
| `pytest` | ≥9.0 | Testing framework |
| `pytest-asyncio` | ≥1.3 | Async test support |
| `httpx` | latest | HTTP client for RAG API calls |
| `python-dotenv` | latest | Environment variable loading |
| `langchain-openai` | latest | Embeddings support |

---

## License

MIT