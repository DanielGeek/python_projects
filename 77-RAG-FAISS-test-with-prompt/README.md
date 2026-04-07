# 🤖 RAG Prompt Builder - Advanced RAG System with Prompt Engineering

A **sophisticated RAG prompt-building system** that demonstrates how to construct optimized prompts for LLM generation without actually calling the LLM. Built on top of FAISS vector search with advanced prompt engineering patterns.

[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/downloads/)
[![FAISS](https://img.shields.io/badge/FAISS-1.11.0-green.svg)](https://github.com/facebookresearch/faiss)
[![OpenAI](https://img.shields.io/badge/OpenAI-Embeddings-orange.svg)](https://platform.openai.com/docs/guides/embeddings)
[![Prompt Engineering](https://img.shields.io/badge/Prompt_Engineering-Advanced-purple.svg)](https://github.com/DanielGeek)

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [How It Works](#-how-it-works)
- [Prompt Engineering](#-prompt-engineering)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Technical Details](#-technical-details)

---

## ✨ Features

### **Core Capabilities**
- 📄 **Multi-format Support** - PDF and TXT document processing
- 🔍 **Semantic Search** - FAISS-powered vector similarity search
- 🤖 **Prompt Building** - Constructs optimized prompts for LLM generation
- 📊 **Context Ranking** - Shows relevance scores for retrieved chunks
- 💾 **Persistent Storage** - Index and metadata saved to disk
- 🎯 **Smart Chunking** - Configurable chunk size with overlap

### **Advanced Features**

- ✅ **System Prompt Integration** - Configurable system prompts for different use cases
- ✅ **Context Assembly** - Automatically formats retrieved contexts into prompt
- ✅ **Score-based Ranking** - Shows similarity scores for transparency
- ✅ **No LLM Calls** - Focuses on prompt construction without generation costs
- ✅ **CLI Interface** - Interactive command-line prompt builder
- ✅ **Error Handling** - Graceful error handling for edge cases

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    RAG PROMPT BUILDER PIPELINE               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. DOCUMENT LOADING                                         │
│     ├─ PDF Extraction (PyMuPDF)                             │
│     └─ TXT Loading                                          │
│                                                              │
│  2. TEXT CHUNKING                                           │
│     ├─ Chunk Size: 500 characters                           │
│     └─ Overlap: 100 characters                              │
│                                                              │
│  3. EMBEDDING GENERATION                                     │
│     ├─ Model: text-embedding-3-small                        │
│     ├─ Batch Size: 100 texts                                │
│     └─ L2 Normalization                                     │
│                                                              │
│  4. FAISS INDEXING                                          │
│     ├─ IndexFlatIP (Inner Product)                          │
│     ├─ Cosine Similarity Search                             │
│     └─ Persistent Storage                                   │
│                                                              │
│  5. RETRIEVAL                                               │
│     ├─ Query Embedding                                      │
│     ├─ Top-K Search (default: 3)                            │
│     └─ Scored Results                                       │
│                                                              │
│  6. PROMPT CONSTRUCTION                                     │
│     ├─ System Prompt Integration                            │
│     ├─ Context Assembly                                     │
│     └─ Final Prompt Output                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### **Prerequisites**
- Python 3.12+
- OpenAI API Key
- `uv` package manager (recommended) or `pip`

### **Installation**

```bash
# Clone the repository
cd 77-RAG-FAISS-test-with-prompt

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

### **Add Documents**

Place your PDF or TXT files in the `documents/` folder:
```bash
documents/
├── s22_manual.pdf
├── your_document.pdf
└── notes.txt
```

### **Run**

```bash
# Build index and start prompt builder
python main.py

# Interactive prompt builder
>>> How do I reset my device?
```

---

## 🔧 How It Works

### **1. Document Processing**
```python
# Extracts text from PDFs using PyMuPDF
docs = load_documents("documents/")
# Returns: [{"text": "...", "metadata": {"source": "file.pdf"}}, ...]
```

### **2. Vector Search & Retrieval**
```python
# Embeds query and retrieves relevant chunks
hits = retrieve("How to reset device?", k=3)
# Returns: [{"text": "...", "meta": {...}, "score": 0.89}, ...]
```

### **3. Prompt Construction**
```python
# Builds complete prompt for LLM
prompt = (
    SYSTEM_PROMPT + "\n\n" +
    "Context:\n" + context_block + "\n\n" +
    f"Question: {query}\nAnswer:"
)
```

---

## 🎯 Prompt Engineering

### **System Prompt Strategy**

The system uses a carefully crafted system prompt:

```python
SYSTEM_PROMPT = (
    "You are a concise, highly accurate assistant. "
    "If the answer cannot be found in the provided context, say 'I don't know.'"
)
```

**Key Principles:**
- **Conciseness** - Encourages brief, focused responses
- **Accuracy** - Prioritizes correct information
- **Honesty** - Explicitly handles unknown answers
- **Context-bound** - Forces reliance on provided context

### **Context Assembly Pattern**

```text
<SYSTEM_PROMPT>

Context:
<RETRIEVED_CHUNK_1>

<RETRIEVED_CHUNK_2>

<RETRIEVED_CHUNK_3>

Question: <USER_QUERY>
Answer:
```

### **Benefits of This Approach**

1. **Cost Control** - No LLM generation costs during development
2. **Prompt Transparency** - See exactly what would be sent to LLM
3. **Quality Assessment** - Evaluate context quality before generation
4. **Debugging** - Easy to identify retrieval issues
5. **Flexibility** - Swap system prompts for different use cases

---

## ⚙️ Configuration

Edit these constants in `main.py`:

```python
DOCS_DIR = "documents"              # Document folder
DB_DIR = "faiss_index"              # Index storage directory
CHUNK_SIZE = 500                    # Characters per chunk
CHUNK_OVERLAP = 100                 # Overlap between chunks
EMBED_MODEL = "text-embedding-3-small" # OpenAI embedding model
MAX_CONTEXTS = 3                    # Number of chunks to retrieve
SYSTEM_PROMPT = "You are a concise, highly accurate assistant..."
```

**Custom System Prompts Examples:**

```python
# Technical Documentation Assistant
TECH_PROMPT = (
    "You are a technical documentation expert. "
    "Provide step-by-step instructions with clear formatting. "
    "Use technical terminology appropriately."
)

# Customer Support Assistant
SUPPORT_PROMPT = (
    "You are a helpful customer support agent. "
    "Be empathetic and provide actionable solutions. "
    "If the answer isn't in the context, suggest contacting support."
)

# Research Assistant
RESEARCH_PROMPT = (
    "You are a research assistant. "
    "Provide comprehensive answers with citations to the source material. "
    "Acknowledge limitations in the provided context."
)
```

---

## 💻 Usage

### **Interactive Mode**
```bash
python main.py

RAG prompt-builder CLI — type 'exit' to quit

>>> How do I reset my device?

🔍 Retrieved Contexts:

[1] s22_manual.pdf (score=0.892)
To reset your device, go to Settings > General > Reset > Erase All Content and Settings...

[2] s22_manual.pdf (score=0.845)
Before resetting, make sure to backup your data to prevent data loss...

[3] s22_manual.pdf (score=0.789)
Reset options include: Reset All Settings, Erase All Content, Reset Network Settings...

📝 Prompt that would be sent to the LLM:

You are a concise, highly accurate assistant. If the answer cannot be found in the provided context, say 'I don't know.'

Context:
To reset your device, go to Settings > General > Reset > Erase All Content and Settings...

Before resetting, make sure to backup your data to prevent data loss...

Reset options include: Reset All Settings, Erase All Content, Reset Network Settings...

Question: How do I reset my device?
Answer:
```

### **Programmatic Usage**
```python
from main import retrieve, show_prompt

# Retrieve relevant contexts
hits = retrieve("battery optimization", k=3)

# Build and display prompt
show_prompt("battery optimization")

# Custom system prompt
import main
main.SYSTEM_PROMPT = "You are a battery optimization expert..."
show_prompt("How to extend battery life?")
```

---

## 📁 Project Structure

```
77-RAG-FAISS-test-with-prompt/
├── main.py                 # Main RAG prompt builder implementation
├── pyproject.toml          # Dependencies (uv)
├── .env                    # OpenAI API key
├── .env.example            # Environment template
├── documents/              # Input documents (PDF/TXT)
│   └── s22_manual.pdf
├── faiss_index/            # Generated index (auto-created)
│   ├── index.faiss         # FAISS vector index
│   └── docs.pkl            # Chunk texts + metadata
└── README.md               # This file
```

---

## 🔬 Technical Details

### **Key Differences from Project 76**

| Feature | Project 76 (Basic RAG) | Project 77 (Prompt Builder) |
|---------|------------------------|----------------------------|
| **Output** | Raw retrieved chunks | Formatted LLM prompt |
| **LLM Calls** | None (retrieval only) | None (prompt building only) |
| **System Prompt** | Not included | Integrated and configurable |
| **Context Assembly** | Manual | Automatic formatting |
| **CLI Interface** | Basic retrieval | Interactive prompt builder |
| **Use Case** | Understanding RAG basics | Learning prompt engineering |

### **Prompt Construction Pipeline**

```python
def show_prompt(query: str):
    # 1. Retrieve relevant contexts
    hits = retrieve(query)
    
    # 2. Display retrieved contexts with scores
    for rank, h in enumerate(hits, 1):
        print(f"[{rank}] {h['meta']['source']} (score={h['score']:.3f})")
        print(h['text'])
    
    # 3. Assemble context block
    context_block = "\n\n".join(h["text"] for h in hits)
    
    # 4. Build complete prompt
    prompt = (
        SYSTEM_PROMPT + "\n\n" +
        "Context:\n" + context_block + "\n\n" +
        f"Question: {query}\nAnswer:"
    )
    
    # 5. Display final prompt
    print("📝 Prompt that would be sent to the LLM:")
    print(prompt)
```

### **Performance Characteristics**

- **Indexing**: ~100 chunks/second (depends on OpenAI API)
- **Retrieval**: <1ms for 1000 chunks (CPU)
- **Prompt Building**: <10ms (string operations)
- **Memory**: ~6KB per chunk + prompt overhead
- **Cost**: $0 (no LLM generation)

---

## 🎯 Use Cases

### **Educational**
- 📚 **RAG Learning** - Understand how RAG prompts are constructed
- 🎓 **Prompt Engineering** - Study prompt patterns and techniques
- 🔍 **Retrieval Analysis** - Evaluate context quality before generation

### **Development**
- 🛠️ **Prompt Development** - Test and refine system prompts
- 📊 **Context Quality** - Assess retrieved content effectiveness
- 🧪 **A/B Testing** - Compare different prompt strategies

### **Production**
- 💰 **Cost Control** - Validate prompts before expensive LLM calls
- 🔧 **Debugging** - Identify retrieval issues without generation noise
- 📈 **Optimization** - Fine-tune retrieval parameters

---

## 🚀 Next Steps

### **Enhancements**
- [ ] Add LLM generation mode (optional flag)
- [ ] Implement multiple prompt templates
- [ ] Add context relevance scoring
- [ ] Support different output formats (JSON, XML)
- [ ] Add prompt evaluation metrics

### **Integration**
- [ ] Connect to various LLM providers
- [ ] Add streaming prompt generation
- [ ] Implement prompt caching
- [ ] Add prompt versioning

### **Advanced Features**
- [ ] Dynamic prompt engineering based on query type
- [ ] Context compression for long documents
- [ ] Multi-turn conversation support
- [ ] Prompt optimization using ML

---

## 📚 Dependencies

```toml
numpy = "2.3.1"              # Array operations
PyMuPDF = "1.26.1"           # PDF text extraction
faiss-cpu = "1.11.0"         # Vector search
openai = "1.93.0"            # Embeddings API
tqdm = "4.67.1"              # Progress bars
python-dotenv = "*"          # Environment variables
```

---

## 🤝 Contributing

This is a learning project demonstrating RAG prompt engineering. Feel free to:
- Fork and experiment with different system prompts
- Add new prompt templates
- Implement evaluation metrics
- Share prompt engineering patterns

---

## 📝 License

MIT License - Free to use and modify

---

## 🎓 Learning Resources

- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [RAG Systems Explained](https://www.pinecone.io/learn/retrieval-augmented-generation/)
- [FAISS Documentation](https://github.com/facebookresearch/faiss/wiki)
- [OpenAI Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)

---

**Built with ❤️ as part of the Python AI Projects series**