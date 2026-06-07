# RAG Evaluation with Ragas

This repository contains automated tests to evaluate Retrieval-Augmented Generation (RAG) pipelines using the **Ragas** framework.

It focuses on **three key metrics**:

---

## 📌 Metrics Explained

### 1. Context Recall

Measures how complete the retrieved context is.

> *"Did we retrieve all the necessary information to answer the question correctly?"*

- High recall → important information is not missing
- Low recall → missing critical context chunks

---

### 2. Context Precision (Without Reference)

Measures how relevant the retrieved documents are.

> *"How much of the retrieved context is actually useful?"*

- High precision → mostly relevant chunks
- Low precision → noisy or irrelevant chunks included

---

### 3. Faithfulness

Measures how factually accurate the generated answer is relative to the retrieved context.

> *"Does the answer stay faithful to the provided context without hallucinating?"*

- High faithfulness → answer is fully supported by the context
- Low faithfulness → answer contains information not present in the context (hallucination)

---

## 🧪 Project Structure

```
85-LLM-Evaluation/
├── .env.example                          # Environment variables template
├── pyproject.toml                        # Project config & dependencies
├── pytest.ini                            # Pytest configuration
├── README.md                             # This file
├── helpers/
│   ├── chat_completions.py               # CleanOpenAI wrapper (fixes max_tokens conflict)
│   └── llm_response.py                   # load_test_data() + get_llm_response() (RAG API client)
├── test_data/
│   ├── data.json                         # Generic test questions with references
│   ├── faithfulness/selenium_faithfulness.json    # Test data for Faithfulness
│   ├── precision/selenium_precision.json           # Test data for Context Precision
│   └── recall/selenium_recall.json                 # Test data for Context Recall
├── tests/
│   ├── __init__.py
│   ├── conftest.py                       # Shared fixtures: ragas_llm, get_data
│   ├── test_faithfulness.py              # Faithfulness metric test
│   ├── test_context_precision.py         # Context Precision metric test
│   └── test_context_recall.py            # Context Recall metric test
└── postman/
    └── RAG_COURSE.postman_collection.json # Postman collection for the RAG API
```

---

## ⚙️ Setup

### 1. Install dependencies

```bash
uv sync
```

### 2. Set environment variables

Create a `.env` file in the project root:

```bash
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-5.4-nano
# OPENAI_MODEL=gpt-4.1-mini
```

---

## 🚀 Run Tests

### Run all tests

```bash
uv run pytest
```

### Run Context Recall test

```bash
uv run pytest tests/test_context_recall.py -s
```

### Run Context Precision test

```bash
uv run pytest tests/test_context_precision.py -s
```

### Run Faithfulness test

```bash
uv run pytest tests/test_faithfulness.py -s
```

---

## 📡 Data Source

This project uses a sample RAG API:

```
https://rahulshettyacademy.com/rag-llm/ask
```

It returns:
- `answer` — the generated response
- `retrieved_docs` — a list of documents used as retrieval context (each with `page_content`)

---

## 🧠 Key Idea

The goal is to evaluate how good your RAG system is before blaming the LLM.

Good RAG systems require:

- **High Context Recall** → nothing important is missing
- **High Context Precision** → minimal noise in retrieved chunks
- **High Faithfulness** → the answer is factually grounded in the context

---

## 🧪 Example Workflow

1. Send question to RAG API
2. Collect `answer` and `retrieved_docs`
3. Build `SingleTurnSample(user_input, response, retrieved_contexts, reference)`
4. Run Ragas metric (e.g., `Faithfulness.ascore(...)`)
5. Validate score threshold (e.g., `score.value >= 0.8`)

---

## 📈 Expected Outcome

A well-tuned RAG system should achieve:

| Metric              | Expected Score |
|---------------------|----------------|
| Context Recall      | ≥ 0.8          |
| Context Precision   | ≥ 0.8          |
| Faithfulness        | ≥ 0.8          |

---

## 🛠 Tech Stack

- Python 3.11+
- pytest + pytest-asyncio
- httpx (async HTTP client)
- Ragas (evaluation framework)
- LangChain / LangChain-OpenAI
- OpenAI API
- uv package manager

---

## 📌 Architecture Details

### `CleanOpenAI` wrapper (`helpers/chat_completions.py`)

The `CleanOpenAI` class extends `AsyncOpenAI` to strip the `max_tokens` parameter before sending requests to the OpenAI API. This prevents the `invalid_parameter_combination` error that occurs when both `max_tokens` and `max_completion_tokens` are passed simultaneously.

```python
class CleanOpenAI(AsyncOpenAI):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.chat.completions = CleanChatCompletions(super().chat.completions)
```

### Shared fixtures (`tests/conftest.py`)

- **`ragas_llm`**: Creates a Ragas LLM instance using `CleanOpenAI` with `temperature=0` and `max_completion_tokens=1024`.
- **`get_data`**: An async parametrized fixture that calls the RAG API for each test case and returns a `SingleTurnSample`.

### Test data structure

Each test data JSON file contains an array of test cases with:

| Metric         | Fields                                         |
|----------------|------------------------------------------------|
| Context Recall | `question`, `reference`                        |
| Context Precision | `question`, `reference`                    |
| Faithfulness   | `question`, `answer`, `retrieved_contexts`     |

---
