# 82-RAG-FAISS-RAGAS-tests

**Advanced RAG System with FAISS Vector Search and Comprehensive Ragas Evaluation Metrics**

> Production-ready Retrieval-Augmented Generation system with automated quality assessment using Ragas framework for comprehensive RAG evaluation.

## 🌟 Features

### **Core RAG System**
- ✅ **FAISS Vector Search** - High-performance similarity search with CPU/GPU support
- ✅ **OpenAI Embeddings** - State-of-the-art text-embedding-3-small model
- ✅ **PDF Document Processing** - Automatic text extraction with PyMuPDF
- ✅ **Intelligent Chunking** - Configurable chunk size and overlap for optimal context
- ✅ **Context Retrieval** - Top-K most relevant document chunks
- ✅ **GPT-4o-mini Integration** - Fast, cost-effective answer generation

### **Comprehensive Evaluation Suite**
- ✅ **Answer Relevancy** - Measures how well answers address user questions
- ✅ **Faithfulness/Truthfulness** - Evaluates factual accuracy against retrieved context
- ✅ **Context Precision** - Assesses relevance of retrieved contexts
- ✅ **Context Recall** - Measures completeness of context retrieval
- ✅ **LLM-as-Judge** - Automated evaluation using OpenAI models
- ✅ **Detailed Analysis** - Multi-dimensional reasoning for each evaluation

### **Testing & Quality Assurance**
- ✅ **Pytest Integration** - Professional test suite with detailed reporting
- ✅ **Progress Tracking** - Real-time progress bars for long-running evaluations
- ✅ **Threshold-based Testing** - Configurable quality thresholds for automated validation
- ✅ **Comprehensive Logging** - Detailed execution logs for debugging and monitoring

## 🏗️ Architecture

```
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
                    │  Ragas Metrics  │
                    │                 │
                    │ • Relevancy     │
                    │ • Faithfulness  │
                    │ • Precision     │
                    │ • Recall        │
                    └─────────────────┘
```

## 🚀 Quick Start

### **Prerequisites**
- Python 3.12+
- OpenAI API key
- PDF documents in `../Documents/` folder

### **Installation**

```bash
# Clone the repository
git clone <repository-url>
cd 82-RAG-FAISS-RAGAS-tests

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
ANTHROPIC_API_KEY=your-anthropic-api-key-here  # Optional
```

3. **Prepare documents:**
```bash
# Add PDF documents to the Documents folder
mkdir -p ../Documents
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

# Run specific metric tests
uv run pytest tests/test_answer_relevancy.py -v
uv run pytest tests/test_truthfulness.py -v
uv run pytest tests/test_context_precision.py -v
uv run pytest tests/test_context_recall.py -v

# Run with detailed output
uv run pytest tests/ -v -s
```

## 🔧 How It Works

### **1. Document Processing Pipeline**

```python
# PDF → Text → Chunks → Embeddings → FAISS Index
documents = load_documents()           # Load PDFs from ../Documents/
chunks = chunk_documents(documents)     # Split into 1500-char chunks
embeddings = generate_embeddings(chunks) # OpenAI text-embedding-3-small
index = create_faiss_index(embeddings)  # Build searchable vector index
```

### **2. RAG Query Pipeline**

```python
# Question → Context Retrieval → Answer Generation
def generate_answer(question):
    contexts = retrieve_relevant_chunks(question)  # Top-3 similar chunks
    prompt = build_prompt(question, contexts)      # Format with system prompt
    answer = openai_chat_completion(prompt)        # GPT-4o-mini response
    return answer
```

### **3. Evaluation Pipeline**

```python
# RAG Output → Ragas Metrics → Quality Assessment
def evaluate_rag_quality(question, answer, contexts, reference):
    dataset = prepare_ragas_dataset(question, answer, contexts, reference)
    scores = ragas_evaluate(dataset, metrics=[relevancy, faithfulness, ...])
    return scores
```

## ⚙️ Configuration

### **Vector Search Settings**

```python
# In main.py
CHUNK_SIZE = 1500          # Text chunk size for document splitting
CHUNK_OVERLAP = 300        # Overlap between chunks for context continuity
EMBED_MODEL = "text-embedding-3-small"  # OpenAI embedding model
MAX_CONTEXTS = 3           # Number of retrieved contexts for RAG
DOCS_DIR = "../Documents"  # Directory containing PDF documents
```

### **Model Settings**

```python
LLM_MODEL = "gpt-4o-mini"  # Answer generation model
SYSTEM_PROMPT = (
    "You are a concise, highly accurate assistant. "
    "If the answer cannot be found in the provided context, say 'I don't know.'"
)
```

### **Evaluation Thresholds**

```python
# In test files
DEFAULT_THRESHOLD = 0.5    # Minimum score for test to pass
# Can be adjusted per test case
```

## 📖 Usage Examples

### **Basic Q&A**

```python
from main import generate_answer

# Ask a question
question = "What is the water resistance rating of the Galaxy S22?"
answer = generate_answer(question)
print(f"Answer: {answer}")
```

### **Custom Evaluation**

```python
from ragas import evaluate
from ragas.metrics import answer_relevancy, faithfulness

# Prepare test data
test_data = [{
    "question": "Your question here",
    "answer": "Generated answer",
    "contexts": ["Retrieved context 1", "Retrieved context 2"],
    "ground_truths": ["Expected answer"]
}]

# Run evaluation
dataset = Dataset.from_list(test_data)
results = evaluate(dataset, metrics=[answer_relevancy, faithfulness])
print(f"Relevancy: {results['answer_relevancy']}")
print(f"Faithfulness: {results['faithfulness']}")
```

### **Batch Processing**

```python
# Process multiple questions
questions = [
    "What is the IP rating?",
    "How does wireless charging work?",
    "What camera modes are available?"
]

for q in questions:
    answer = generate_answer(q)
    print(f"Q: {q}")
    print(f"A: {answer}\n")
```

## 📁 Project Structure

```
82-RAG-FAISS-RAGAS-tests/
├── main.py                    # Core RAG implementation
├── pyproject.toml            # Project configuration and dependencies
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore patterns
├── README.md                 # This file
├── faiss_index/              # Generated vector database
│   ├── index.faiss          # FAISS index file
│   └── docs.pkl             # Document metadata
├── tests/                    # Evaluation test suite
│   ├── __init__.py
│   ├── shared_dataset.py    # Common test data
│   ├── test_answer_relevancy.py    # Answer relevancy tests
│   ├── test_truthfulness.py         # Faithfulness tests
│   ├── test_context_precision.py    # Context precision tests
│   └── test_context_recall.py       # Context recall tests
└── ../Documents/             # Source PDF documents
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

### **Evaluation Metrics**

| Metric | Purpose | Score Range | Cost per Evaluation |
|--------|---------|-------------|-------------------|
| **Answer Relevancy** | How well answer addresses question | 0.0 - 1.0 | ~$0.002 |
| **Faithfulness** | Factual accuracy against context | 0.0 - 1.0 | ~$0.003 |
| **Context Precision** | Relevance of retrieved contexts | 0.0 - 1.0 | ~$0.002 |
| **Context Recall** | Completeness of context retrieval | 0.0 - 1.0 | ~$0.002 |

### **Performance Benchmarks**

| Operation | Average Time | Cost (USD) |
|-----------|-------------|------------|
| **Document Indexing** | 30-60 seconds per 100 pages | $0.05-0.10 |
| **Single Query** | 2-4 seconds | $0.002-0.005 |
| **Full Evaluation (4 metrics)** | 60-120 seconds | $0.008-0.015 |
| **Batch Test (7 questions)** | 90-180 seconds | $0.05-0.10 |

### **Comparison with Other Projects**

| Feature | Project 80 | Project 81 | **Project 82** |
|---------|------------|------------|----------------|
| **Vector Search** | ✅ FAISS | ❌ N/A | ✅ FAISS |
| **RAG Pipeline** | ✅ Basic | ❌ N/A | ✅ Advanced |
| **Evaluation** | ❌ Manual | ✅ DeepEval | ✅ **Ragas (4 metrics)** |
| **Test Coverage** | ✅ Basic | ❌ N/A | ✅ **Comprehensive** |
| **LLM Integration** | ✅ OpenAI | ✅ OpenAI | ✅ **OpenAI + Evaluation** |
| **Production Ready** | ✅ Yes | ❌ Demo | ✅ **Enterprise** |

## 🎯 Use Cases

### **Document Q&A Systems**
- **Technical Documentation** - Instant answers from manuals and guides
- **Legal Documents** - Contract analysis and clause extraction
- **Research Papers** - Literature review and fact extraction
- **Product Manuals** - Troubleshooting and feature explanations

### **Quality Assurance**
- **RAG System Testing** - Automated quality assessment
- **Content Validation** - Fact-checking against source documents
- **Performance Monitoring** - Continuous evaluation of RAG outputs
- **A/B Testing** - Compare different retrieval strategies

### **Enterprise Applications**
- **Knowledge Management** - Internal document search and Q&A
- **Customer Support** - Automated response generation
- **Compliance Checking** - Verify responses against documentation
- **Training Systems** - Educational content delivery

## 🎓 Learning Resources

### **RAG Fundamentals**
- [LangChain RAG Documentation](https://python.langchain.com/docs/use_cases/question_answering/)
- [FAISS Documentation](https://faiss.ai/index.html)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)

### **Evaluation Frameworks**
- [Ragas Documentation](https://docs.ragas.io/)
- [DeepEval Guide](https://docs.confident-ai.com/)
- [LLM-as-a-Judge Paper](https://arxiv.org/abs/2306.05685)

### **Best Practices**
- [RAG System Design Patterns](https://www.pinecone.io/learn/series/rag/)
- [Vector Database Optimization](https://weaviate.io/blog/vector-database-optimization)
- [Evaluation Metrics Guide](https://docs.ragas.io/en/latest/concepts/metrics/index.html)

## 📦 Dependencies

```toml
[project]
name = "82-rag-faiss-ragas-tests"
version = "0.1.0"
description = "RAG with FAISS and Ragas tests"
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
# Answer relevancy evaluation
uv run pytest tests/test_answer_relevancy.py -v

# Faithfulness evaluation
uv run pytest tests/test_truthfulness.py -v

# Context precision evaluation
uv run pytest tests/test_context_precision.py -v

# Context recall evaluation
uv run pytest tests/test_context_recall.py -v
```

### **Test Configuration**
```toml
# pyproject.toml
[tool.pytest.ini_options]
addopts = "-s -v"                    # Show output and verbose
asyncio_default_fixture_loop_scope = "function"  # Fix asyncio warnings
```

### **Expected Test Results**
- **Answer Relevancy**: 0.8-1.0 for good answers
- **Faithfulness**: 0.7-1.0 for factually accurate responses
- **Context Precision**: 0.6-1.0 for relevant retrieved contexts
- **Context Recall**: 0.5-1.0 for comprehensive context retrieval

## 🤝 Contributing

### **Development Setup**
```bash
# Clone repository
git clone <repository-url>
cd 82-RAG-FAISS-RAGAS-tests

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
1. Create new test file: `tests/test_new_metric.py`
2. Implement metric using Ragas framework
3. Add to evaluation suite
4. Update documentation

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
- **[75-langchain-production-API](../75-langchain-production-API/)** - Production-ready LangGraph API

## 📞 Support

For questions, issues, or contributions:
- Create an issue in the repository
- Check the [documentation](https://docs.ragas.io/)
- Review existing test cases for examples

---

**Built with ❤️ using OpenAI, FAISS, and Ragas**