# 🔬 RAG with FAISS - DeepEval Tests

A **comprehensive RAG evaluation system** that combines FAISS vector search with DeepEval's LLM-as-a-Judge metrics. This project demonstrates automated evaluation of text generation quality using state-of-the-art NLP assessment frameworks.

[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/downloads/)
[![FAISS](https://img.shields.io/badge/FAISS-1.11.0-green.svg)](https://github.com/facebookresearch/faiss)
[![DeepEval](https://img.shields.io/badge/DeepEval-3.2.4-purple.svg)](https://github.com/confident-ai/deepeval)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-orange.svg)](https://platform.openai.com/docs/guides/chat)
[![RAGAS](https://img.shields.io/badge/RAGAS-0.2.10-blue.svg)](https://docs.ragas.io/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [How It Works](#-how-it-works)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Technical Details](#-technical-details)
- [Learning Resources](#-learning-resources)

---

## ✨ Features

### **Core Capabilities**

- 📄 **Text Summarization** - Multi-language summarization with GPT-4o-mini
- 🔄 **Back-Translation** - Round-trip translation for quality assessment
- 🧪 **LLM-as-Judge** - Automated evaluation with DeepEval GEval metrics
- 📊 **Quality Metrics** - Fluency, Coherence, Relevance, and Concision scoring
- 🤖 **Custom LLM Wrapper** - Flexible model integration with error handling
- 🎯 **Error Resilience** - Graceful handling with ErrorConfig

### **Advanced Features**

- ✅ **GEval Metrics** - Custom evaluation criteria using LLM judges
- ✅ **Multi-language Support** - Summarize and translate across languages
- ✅ **Automated Scoring** - 0-100% pass rates for each quality dimension
- ✅ **Confidence AI Integration** - Track and analyze evaluation results
- ✅ **RAGAS Support** - Ready for RAG-specific evaluation metrics
- ✅ **Evaluation Datasets** - Structured test case management

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                RAG + DEEPEVAL TESTING SYSTEM                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Input Text   │───▶│ Summarization│───▶│   Foreign    │  │
│  │ (English)    │    │ (GPT-4o-mini)│    │  Language    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                   │          │
│                                                   ▼          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   DeepEval   │◄───│ Back-Trans   │◄───│   Spanish    │  │
│  │   Metrics    │    │   (English)  │    │   Summary    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────┐                                            │
│  │   Results    │                                            │
│  │ Fluency: 100%│                                            │
│  │Coherence:100%│                                            │
│  │Relevance:100%│                                            │
│  │Concision:100%│                                            │
│  └──────────────┘                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### **Prerequisites**

- Python 3.12+
- OpenAI API key
- UV package manager (recommended)

### **Installation**

```bash
# Clone the repository
cd 81-RAG-FAISS-Deepeval-tests

# Install dependencies with uv
uv sync

# Or with pip
pip install -r requirements.txt
```

### **Configuration**

Create a `.env` file:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### **Prepare Data**

Place your input files in the `data/` folder:

```text
data/
├── input_text.txt      # Source text to summarize
└── reference_summary.txt # Optional reference for comparison
```

### **Run**

```bash
# Run the evaluation pipeline
uv run main.py

# Output:
# 🔹 Loading input and reference text...
# 🌍 Generating summary in foreign language...
# 🌐 Foreign-Language Summary:
# ...
# 🔁 Back-translating to English...
# 🔎 Evaluation with DeepEval (LLM-as-a-Judge)...
# ===================================================================
# Overall Metric Pass Rates
# Fluency [GEval]: 100.00% pass rate
# Coherence [GEval]: 100.00% pass rate
# Relevance [GEval]: 100.00% pass rate
# Concision [GEval]: 100.00% pass rate
# ===================================================================
```

---

## 🔧 How It Works

### **1. Text Loading**

```python
def load_text(filepath):
    """Load text from file with UTF-8 encoding."""
    with open(filepath, "r", encoding="utf-8") as f:
        return f.read().strip()
```

### **2. Foreign Language Summarization**

```python
def summarize_to_foreign(text: str, target_language: str) -> str:
    """Summarize English text into target language."""
    messages = [
        {
            "role": "user",
            "content": f"Summarize the following English text in {target_language}. "
                       f"Be concise and accurate.\n\n{text}",
        }
    ]
    return gpt4.generate(messages)
```

### **3. Back-Translation**

```python
def back_translate_to_english(foreign_text: str, from_language: str) -> str:
    """Translate foreign text back to English for evaluation."""
    messages = [
        {
            "role": "user",
            "content": f"Translate the following {from_language} text back into English:\n\n{foreign_text}",
        }
    ]
    return gpt4.generate(messages)
```

### **4. DeepEval Metrics**

```python
def run_deepeval_metrics(input_text: str, ai_output: str):
    """Evaluate output quality using GEval metrics."""
    
    # Create test case
    test_case = LLMTestCase(
        input=input_text,
        actual_output=ai_output,
        expected_output=None,
    )
    
    dataset = EvaluationDataset(test_cases=[test_case])
    
    # Define GEval metrics
    fluency = GEval(
        name="Fluency",
        criteria="Is the output grammatically correct and easy to understand?",
        evaluation_params=[LLMTestCaseParams.INPUT, LLMTestCaseParams.ACTUAL_OUTPUT],
    )
    
    # Run evaluation
    evaluate(dataset, metrics=[fluency, coherence, relevance, concision])
```

---

## ⚙️ Configuration

### **Custom LLM Model**

```python
class GPT4ChatModel:
    def __init__(self):
        self.model_name = "gpt-4o-mini"  # Change model here
        self.temperature = 0.7           # Adjust creativity
```

### **GEval Metrics**

```python
# Custom evaluation criteria
custom_metric = GEval(
    name="Accuracy",
    criteria="Does the output accurately capture the key points of the input?",
    evaluation_params=[LLMTestCaseParams.INPUT, LLMTestCaseParams.ACTUAL_OUTPUT],
)
```

### **Error Handling**

```python
# Configure error behavior
error_config = ErrorConfig(
    skip_on_missing_params=True,  # Skip evaluation if params missing
    ignore_errors=False,          # Stop on errors or continue
)
```

---

## 📖 Usage

### **Basic Pipeline**

```python
# Run complete evaluation
uv run main.py
```

### **Custom Evaluation**

```python
from main import run_deepeval_metrics

# Your input and output
input_text = "Your source text here..."
ai_output = "Your generated summary here..."

# Run evaluation
run_deepeval_metrics(input_text, ai_output)
```

### **Adding Custom Metrics**

```python
from deepeval.metrics import GEval

# Create custom metric
accuracy = GEval(
    name="Factual Accuracy",
    criteria="Does the summary contain factually accurate information?",
    evaluation_params=[LLMTestCaseParams.INPUT, LLMTestCaseParams.ACTUAL_OUTPUT],
)

# Use in evaluation
evaluate(dataset, metrics=[fluency, accuracy])
```

---

## 📁 Project Structure

```text
81-RAG-FAISS-Deepeval-tests/
├── main.py                 # Main evaluation pipeline
├── pyproject.toml          # Dependencies (uv)
├── .env                    # OpenAI API key
├── .env.example            # Environment template
├── data/                   # Input data folder
│   ├── input_text.txt      # Source text
│   └── reference_summary.txt # Reference summary
├── faiss_index/            # FAISS index (optional)
├── .deepeval/              # DeepEval cache and logs
└── README.md               # This file
```

---

## 🔬 Technical Details

### **Key Differences from Previous Projects**

| Feature | Project 80 (Top-K Enhanced) | Project 81 (DeepEval Tests) |
|---------|----------------------------|----------------------------|
| **Evaluation** | Basic pytest | **DeepEval GEval metrics** |
| **Metrics** | Keyword matching | **LLM-as-Judge scoring** |
| **Quality Dimensions** | Pass/Fail | **0-100% scoring** |
| **RAGAS Support** | No | **Integrated** |
| **Use Case** | RAG retrieval | **RAG evaluation & testing** |

### **DeepEval Metrics Explained**

#### **1. Fluency**
- **Criteria**: Grammatical correctness and readability
- **Use Case**: Ensure outputs are natural and error-free

#### **2. Coherence**
- **Criteria**: Logical structure and cohesion
- **Use Case**: Verify that ideas flow logically

#### **3. Relevance**
- **Criteria**: Directly answers the input/query
- **Use Case**: Check that output addresses the input

#### **4. Concision**
- **Criteria**: Avoids redundancy while preserving meaning
- **Use Case**: Ensure summaries are concise yet complete

### **GEval vs Traditional Metrics**

| Aspect | Traditional | GEval (LLM-as-Judge) |
|--------|-------------|---------------------|
| **ROUGE/BLEU** | N-gram overlap | Semantic understanding |
| **Accuracy** | Exact matching | Contextual interpretation |
| **Flexibility** | Fixed algorithms | Custom criteria |
| **Human-like** | No | Yes |

---

## 🎯 Use Cases

### **1. Summarization Quality Assessment**

- Evaluate news article summaries
- Assess meeting transcript summaries
- Compare different summarization approaches

### **2. Translation Quality**

- Back-translation evaluation
- Cross-lingual summarization
- Machine translation assessment

### **3. RAG System Testing**

- Evaluate retrieval-augmented generation
- Test answer quality vs context relevance
- Benchmark different RAG configurations

### **4. Content Generation**

- Blog post quality assessment
- Product description evaluation
- Technical documentation review

---

## 🎓 Learning Resources

### **DeepEval Documentation**

- [DeepEval Quickstart](https://docs.confident-ai.com/)
- [GEval Metrics](https://docs.confident-ai.com/docs/metrics-llm-evals)
- [RAGAS Integration](https://docs.confident-ai.com/docs/evaluation-ragas)

### **Related Projects**

- **[80-RAG-FAISS-with-top-k](../80-RAG-FAISS-with-top-k)** - Top-K enhanced RAG with testing
- **[76-RAG-FAISS-test](../76-RAG-FAISS-test)** - Basic RAG with FAISS
- **[71-langchain-testing-patterns](../71-langchain-testing-patterns)** - LLM testing patterns

---

## 📝 Dependencies

```toml
numpy = "2.3.1"              # Array operations
PyMuPDF = "1.26.1"           # PDF text extraction
faiss-cpu = "1.11.0"         # Vector search
openai = "1.93.0"            # GPT-4o-mini for generation
pytest = "8.2.2"             # Testing framework
deepeval = "3.2.4"           # LLM-as-Judge evaluation
ragas = "0.2.10"             # RAG evaluation metrics
datasets = "2.19.1"          # HuggingFace datasets
```

---

## 🤝 Contributing

This is a learning project demonstrating RAG evaluation with DeepEval. Feel free to:

- Experiment with different GEval criteria
- Add RAGAS metrics for retrieval evaluation
- Test with different languages and models
- Integrate with your own RAG pipelines

---

## 📄 License

MIT License - See [LICENSE](../LICENSE) for details.

---

**Built with ❤️ using DeepEval, OpenAI, and FAISS**