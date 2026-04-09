# 83-RAG-DeepEval

**Advanced RAG System with DeepEval LLM-as-a-Judge Evaluation**

> Production-ready Retrieval-Augmented Generation system with comprehensive evaluation using DeepEval framework for automated quality assessment.

## 🌟 Features

### **Core RAG System**
- ✅ **FAISS Vector Search** - High-performance similarity search with CPU support
- ✅ **OpenAI Embeddings** - State-of-the-art text-embedding-3-small model
- ✅ **PDF Document Processing** - Automatic text extraction with PyMuPDF
- ✅ **Intelligent Chunking** - Configurable chunk size and overlap for optimal context
- ✅ **Context Retrieval** - Top-K most relevant document chunks
- ✅ **GPT-4o-mini Integration** - Fast, cost-effective answer generation

### **DeepEval Evaluation Suite**

- ✅ **LLM-as-a-Judge** - Automated evaluation using OpenAI models
- ✅ **GEval Metrics** - Custom evaluation criteria with configurable thresholds
- ✅ **Multi-Metric Assessment** - Fluency, Coherence, Relevance, Concision, Technical Accuracy
- ✅ **HTML Report Generation** - Automated test result reporting
- ✅ **Flexible Testing Framework** - Easy to extend with new metrics and test cases

### **Testing & Quality Assurance**

- ✅ **Pytest Integration** - Professional test suite with detailed reporting
- ✅ **Progress Tracking** - Real-time progress bars for long-running evaluations
- ✅ **Threshold-based Testing** - Configurable quality thresholds for automated validation
- ✅ **Comprehensive Logging** - Detailed execution logs for debugging and monitoring

## 🏗️ Architecture

```text
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   PDF Documents │    │   FAISS Index    │    │  OpenAI Models  │
│                 │    │                  │    │                 │
│ • Text Extraction│───▶│ • Vector Search  │───▶│ • Embeddings    │
│ • Chunking      │    │ • Similarity     │    │ • GPT-4o-mini   │
│ • Processing    │    │ • Retrieval      │    │ • Evaluation    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  RAG Pipeline   │
                    │                 │
                    │ • Query Input   │
                    │ • Context Retrieval│
                    │ • Answer Generation│
                    │ • Quality Assessment│
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │ DeepEval Metrics│
                    │                 │
                    │ • Fluency       │
                    │ • Coherence     │
                    │ • Relevance     │
                    │ • Concision     │
                    │ • Technical     │
                    └─────────────────┘
```

## 🚀 Quick Start

### **Prerequisites**

- Python 3.12+
- OpenAI API key
- PDF documents in `../documents/` folder

### **Installation**

```bash
# Clone the repository
git clone <repository-url>
cd 83-RAG-DeepEval

# Install with uv (recommended)
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -e .

# Or with pip
pip install -e .
```

### **Configuration**

1. **Create environment file:**

```bash
cp .env.example .env
```

2. **Add your OpenAI API key:**

```env
OPENAI_API_KEY=your-openai-api-key-here
```

3. **Prepare documents:**
```bash
# Add PDF documents to the Documents folder
mkdir -p ../documents
# Copy your PDF files here
```

### **Setup Vector Database**

```bash
# Build FAISS index from your documents
uv run python -c "from main import setup; setup()"
```

### **Run Interactive RAG**

```bash
# Start interactive Q&A session
uv run python main.py
```

### **Run Evaluation Tests**

```bash
# Run all evaluation tests
uv run pytest tests/ -v

# Run specific test files
uv run pytest tests/test_main.py -v
uv run pytest tests/test_report_html.py -v

# Run with DeepEval CLI
uv run deepeval test run tests/test_main.py
```

## 🔧 How It Works

### **1. Document Processing Pipeline**

```python
# PDF → Text → Chunks → Embeddings → FAISS Index
documents = load_documents()           # Load PDFs from ../documents/
chunks = chunk_documents(documents)     # Split into 1500-char chunks
embeddings = generate_embeddings(chunks) # OpenAI text-embedding-3-small
index = create_faiss_index(embeddings)  # Build searchable vector index
```

### **2. RAG Query Pipeline**

```python
# Question → Context Retrieval → Answer Generation
def ask_llm(question):
    contexts = retrieve_relevant_chunks(question)  # Top-3 similar chunks
    prompt = build_prompt(question, contexts)      # Format with system prompt
    answer = openai_chat_completion(prompt)        # GPT-4o-mini response
    return answer
```

### **3. DeepEval Evaluation Pipeline**

```python
# RAG Output → DeepEval Metrics → Quality Assessment
def evaluate_rag_quality(question, answer):
    test_case = LLMTestCase(input=question, actual_output=answer)
    metrics = build_metrics()  # Fluency, Coherence, Relevance, etc.
    results = evaluate(test_case, metrics=metrics)
    return results
```

## ⚙️ Configuration

### **Vector Search Settings**

```python
# In main.py
CHUNK_SIZE = 1500          # Text chunk size for document splitting
CHUNK_OVERLAP = 300        # Overlap between chunks for context continuity
EMBED_MODEL = "text-embedding-3-small"  # OpenAI embedding model
MAX_CONTEXTS = 3           # Number of retrieved contexts for RAG
DOCS_DIR = "../documents"  # Directory containing PDF documents
```

### **Model Settings**

```python
LLM_MODEL = "gpt-4o-mini"  # Answer generation model
SYSTEM_PROMPT = (
    "You are a concise, highly accurate assistant. "
    "If the answer cannot be found in the provided context, say 'I don't know.'"
)
```

### **DeepEval Settings**

```python
# In test files
def build_metrics():
    return [
        GEval(name="Fluency", criteria="Is the output grammatically correct?"),
        GEval(name="Coherence", criteria="Is the output logically structured?"),
        GEval(name="Relevance", criteria="Does the output answer the input?", threshold=0.5),
        GEval(name="Concision", criteria="Is the output concise?", threshold=0.5),
        GEval(name="Technical Accuracy", criteria="Is the answer accurate?", threshold=0.5),
    ]
```

## 📖 Usage Examples

### **Basic Q&A**

```python
from main import ask_llm

# Ask a question
question = "What display resolutions can I set on the Galaxy S22 Ultra?"
answer = ask_llm(question)
print(f"Answer: {answer}")
```

### **Custom Evaluation**

```python
from deepeval.test_case import LLMTestCase
from deepeval.metrics import GEval

# Prepare test case
test_case = LLMTestCase(
    input="What camera capabilities does the Galaxy S22 Ultra offer?",
    actual_output=ask_llm("What camera capabilities does the Galaxy S22 Ultra offer?")
)

# Run evaluation
metrics = build_metrics()
for metric in metrics:
    score = metric.measure(test_case)
    print(f"{metric.name}: {score:.3f}")
```

### **HTML Report Generation**

```python
from tests.test_report_html import log_results_to_html

# Generate HTML report
query = "What can I do with the S Pen on the Galaxy S22 Ultra?"
answer = ask_llm(query)
log_results_to_html("S Pen Functionality", query, answer)
# Creates reports/test_report.html
```

## 📁 Project Structure

```
83-RAG-DeepEval/
├── main.py                    # Core RAG implementation
├── pyproject.toml            # Project configuration and dependencies
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore patterns
├── README.md                 # This file
├── faiss_index/              # Generated vector database
│   ├── index.faiss          # FAISS index file
│   └── docs.pkl             # Document metadata
├── tests/                    # Evaluation test suite
│   ├── __init__.py          # Test package initialization
│   ├── test_main.py         # Main evaluation tests
│   └── test_report_html.py  # HTML report generation tests
├── reports/                  # Generated evaluation reports
│   └── test_report.html     # HTML evaluation report
└── ../documents/             # Source PDF documents
    ├── document1.pdf
    ├── document2.pdf
    └── ...
```

## 🔬 Technical Details

### **Vector Database Performance**

| Metric | Value |
|--------|-------|
| **Embedding Model** | OpenAI text-embedding-3-small (1536 dimensions) |
| **Index Type** | FAISS IndexFlatIP (Inner Product) |
| **Chunk Strategy** | Fixed-size with overlap (1500 chars, 300 overlap) |
| **Retrieval Method** | Top-K similarity search (K=3) |
| **Index Size** | ~1MB per 100 pages of documents |

### **DeepEval Metrics**

| Metric | Purpose | Score Range | Threshold |
|--------|---------|-------------|-----------|
| **Fluency** | Grammatical correctness and readability | 0.0 - 1.0 | Default |
| **Coherence** | Logical structure and cohesion | 0.0 - 1.0 | Default |
| **Relevance** | Direct answer to input question | 0.0 - 1.0 | 0.5 |
| **Concision** | Avoidance of redundancy | 0.0 - 1.0 | 0.5 |
| **Technical Accuracy** | Factual correctness | 0.0 - 1.0 | 0.5 |

### **Performance Benchmarks**

| Operation | Average Time | Cost (USD) |
|-----------|-------------|------------|
| **Document Indexing** | 30-60 seconds per 100 pages | $0.05-0.10 |
| **Single Query** | 2-4 seconds | $0.002-0.005 |
| **DeepEval Test (5 metrics)** | 20-40 seconds | $0.003-0.008 |
| **Batch Test (3 questions)** | 60-120 seconds | $0.009-0.024 |

### **Comparison with Other Projects**

| Feature | Project 80 | Project 81 | Project 82 | **Project 83** |
|---------|------------|------------|------------|----------------|
| **Vector Search** | ✅ FAISS | ❌ N/A | ✅ FAISS | ✅ **FAISS** |
| **RAG Pipeline** | ✅ Basic | ❌ N/A | ✅ Advanced | ✅ **Advanced** |
| **Evaluation** | ❌ Manual | ✅ DeepEval | ✅ **Ragas** | ✅ **DeepEval** |
| **Test Coverage** | ✅ Basic | ❌ N/A | ✅ Comprehensive | ✅ **Comprehensive** |
| **LLM Integration** | ✅ OpenAI | ✅ OpenAI | ✅ OpenAI | ✅ **OpenAI + Evaluation** |
| **HTML Reports** | ❌ N/A | ❌ N/A | ❌ N/A | ✅ **Automated** |
| **Production Ready** | ✅ Yes | ❌ Demo | ✅ Enterprise | ✅ **Enterprise** |

## 🎯 Use Cases

### **Document Q&A Systems**
- **Technical Documentation** - Instant answers from manuals and guides
- **Legal Documents** - Contract analysis and clause extraction
- **Research Papers** - Literature review and fact extraction
- **Product Manuals** - Troubleshooting and feature explanations

### **Quality Assurance**
- **RAG System Testing** - Automated quality assessment with LLM-as-a-Judge
- **Content Validation** - Multi-dimensional quality evaluation
- **Performance Monitoring** - Continuous evaluation of RAG outputs
- **A/B Testing** - Compare different retrieval strategies

### **Enterprise Applications**
- **Knowledge Management** - Internal document search and Q&A
- **Customer Support** - Automated response generation with quality control
- **Compliance Checking** - Verify responses against documentation
- **Training Systems** - Educational content delivery with assessment

## 🎓 Learning Resources

### **RAG Fundamentals**
- [LangChain RAG Documentation](https://python.langchain.com/docs/use_cases/question_answering/)
- [FAISS Documentation](https://faiss.ai/index.html)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)

### **DeepEval Framework**
- [DeepEval Documentation](https://docs.confident-ai.com/)
- [LLM-as-a-Judge Paper](https://arxiv.org/abs/2306.05685)
- [Evaluation Metrics Guide](https://docs.confident-ai.com/docs/metrics)

### **Best Practices**
- [RAG System Design Patterns](https://www.pinecone.io/learn/series/rag/)
- [Vector Database Optimization](https://weaviate.io/blog/vector-database-optimization)
- [LLM Evaluation Best Practices](https://docs.confident-ai.com/docs/best-practices)

## 📦 Dependencies

```toml
[project]
name = "83-rag-deepeval"
version = "0.1.0"
description = "RAG with DeepEval tests"
requires-python = ">=3.12"

dependencies = [
    "numpy==2.3.1",           # Core scientific computing
    "PyMuPDF==1.26.1",        # PDF text extraction
    "faiss-cpu==1.11.0",      # Vector search (CPU)
    "tqdm==4.67.1",           # Progress bars
    "openai==1.93.0",         # OpenAI API client
    "pytest==8.2.2",          # Testing framework
    "deepeval==3.2.4",        # LLM-as-a-Judge evaluation
    "ragas==0.2.10",          # RAG evaluation metrics
    "datasets==2.19.1",       # HuggingFace datasets
    "pandas",                 # HTML report generation
    "python-dotenv",          # Environment variables
]
```

### **Development Dependencies**
```bash
# For development
uv pip install --dev pytest-xdist  # Parallel test execution
uv pip install --dev pytest-cov   # Test coverage
uv pip install --dev black        # Code formatting
uv pip install --dev ruff         # Linting
```

## 🧪 Testing

### **Run All Tests**
```bash
# Basic test run
uv run pytest tests/ -v

# With detailed output
uv run pytest tests/ -v -s

# Parallel execution
uv run pytest tests/ -v -n auto
```

### **Individual Test Suites**
```bash
# Main evaluation tests
uv run pytest tests/test_main.py -v

# HTML report generation tests
uv run pytest tests/test_report_html.py -v

# Using DeepEval CLI
uv run deepeval test run tests/test_main.py
```

### **Test Configuration**
```toml
# pyproject.toml
[tool.pytest.ini_options]
addopts = "-s -v"                    # Show output and verbose
asyncio_default_fixture_loop_scope = "function"  # Fix asyncio warnings
```

### **Expected Test Results**
- **Fluency**: 0.7-1.0 for grammatically correct responses
- **Coherence**: 0.6-1.0 for logically structured answers
- **Relevance**: 0.5-1.0 for relevant responses (threshold: 0.5)
- **Concision**: 0.5-1.0 for concise answers (threshold: 0.5)
- **Technical Accuracy**: 0.5-1.0 for factually accurate responses (threshold: 0.5)

## 🤝 Contributing

### **Development Setup**
```bash
# Clone repository
git clone <repository-url>
cd 83-RAG-DeepEval

# Setup development environment
uv venv
source .venv/bin/activate
uv pip install -e ".[dev]"

# Run pre-commit checks
uv run ruff check .
uv run black --check .
uv run pytest tests/
```

### **Adding New Metrics**
1. Create new metric in `tests/test_main.py`:
```python
GEval(
    name="Custom Metric",
    criteria="Your evaluation criteria here",
    evaluation_params=[LLMTestCaseParams.ACTUAL_OUTPUT],
    threshold=0.5,
)
```
2. Add to `build_metrics()` function
3. Update documentation

### **Code Style**
- Follow PEP 8 guidelines
- Use type hints for function signatures
- Add docstrings for public functions
- Keep functions focused and modular

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- **[80-RAG-FAISS-with-top-k](../80-RAG-FAISS-with-top-k/)** - Basic RAG with FAISS and top-K optimization
- **[81-RAG-FAISS-Deepeval-tests](../81-RAG-FAISS-Deepeval-tests/)** - RAG evaluation with DeepEval LLM-as-a-Judge
- **[82-RAG-FAISS-RAGAS-tests](../82-RAG-FAISS-RAGAS-tests/)** - RAG evaluation with Ragas comprehensive metrics

## 📞 Support

For questions, issues, or contributions:
- Create an issue in the repository
- Check the [DeepEval documentation](https://docs.confident-ai.com/)
- Review existing test cases for examples

---

---

**Built with ❤️ using OpenAI, FAISS, and DeepEval**