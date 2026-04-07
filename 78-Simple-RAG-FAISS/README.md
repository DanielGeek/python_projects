# 🚀 Simple RAG with FAISS - Complete RAG System

A **complete end-to-end RAG system** that combines FAISS vector search with OpenAI LLM generation. This project demonstrates the full RAG pipeline from document ingestion to answer generation with real-time responses.

[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/downloads/)
[![FAISS](https://img.shields.io/badge/FAISS-1.11.0-green.svg)](https://github.com/facebookresearch/faiss)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-orange.svg)](https://platform.openai.com/docs/guides/chat)
[![RAG Complete](https://img.shields.io/badge/RAG-Complete-purple.svg)](https://github.com/DanielGeek)

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

---

## ✨ Features

### **Core Capabilities**
- 📄 **Multi-format Support** - PDF and TXT document processing
- 🔍 **Semantic Search** - FAISS-powered vector similarity search
- 🤖 **LLM Generation** - Real-time answer generation with GPT-4o-mini
- 📊 **Context Ranking** - Shows relevance scores for retrieved chunks
- 💾 **Persistent Storage** - Index and metadata saved to disk
- 🎯 **Smart Chunking** - Configurable chunk size with overlap

### **Advanced Features**

- ✅ **Complete RAG Pipeline** - End-to-end retrieval and generation
- ✅ **Real-time Responses** - Live LLM generation with context
- ✅ **System Prompt Integration** - Configurable system prompts for different use cases
- ✅ **Temperature Control** - Adjustable response creativity (0.2 for factual)
- ✅ **Error Handling** - Graceful error handling for API failures
- ✅ **CLI Interface** - Interactive command-line Q&A system

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    COMPLETE RAG PIPELINE                     │
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
│  6. LLM GENERATION                                          │
│     ├─ Context Assembly                                     │
│     ├─ System Prompt Integration                            │
│     ├─ GPT-4o-mini Generation                               │
│     └─ Real-time Response                                   │
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
cd 78-Simple-RAG-FAISS

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

Place your PDF or TXT files in the `../documents` folder:
```bash
../documents/
├── s22_manual.pdf
├── your_document.pdf
└── notes.txt
```

### **Run**

```bash
# Build index and start RAG system
python main.py

# Interactive Q&A system
>>> How do I reset my device?
🧠 Answer: To reset your device, go to Settings > General > Reset...
```

---

## 🔧 How It Works

### **1. Document Processing**
```python
# Extracts text from PDFs using PyMuPDF
docs = load_documents("../documents/")
# Returns: [{"text": "...", "metadata": {"source": "file.pdf"}}, ...]
```

### **2. Vector Search & Retrieval**
```python
# Embeds query and retrieves relevant chunks
hits = retrieve("How to reset device?", k=3)
# Returns: [{"text": "...", "meta": {...}, "score": 0.89}, ...]
```

### **3. LLM Generation**
```python
# Generates answer using retrieved context
answer = generate_answer("How to reset device?")
# Returns: "To reset your device, go to Settings > General > Reset..."
```

---

## ⚙️ Configuration

Edit these constants in `main.py`:

```python
DOCS_DIR = "../documents"           # Document folder (parent directory)
DB_DIR = "faiss_index"              # Index storage directory
CHUNK_SIZE = 500                    # Characters per chunk
CHUNK_OVERLAP = 100                 # Overlap between chunks
EMBED_MODEL = "text-embedding-3-small" # OpenAI embedding model
MAX_CONTEXTS = 3                    # Number of chunks to retrieve
LLM_MODEL = "gpt-4o-mini"           # OpenAI chat model
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

✅ RAG Ready. Ask your question (type 'exit' to quit):

>>> How do I reset my device?
🧠 Answer: To reset your device, go to Settings > General > Reset > Erase All Content and Settings. 
This will remove all data and restore your device to factory settings.

>>> What are the camera specifications?
🧠 Answer: The device features a triple-camera system with a 50MP main sensor, 
12MP ultra-wide lens, and 10MP telephoto lens with 3x optical zoom.

>>> exit
👋 Exiting.
```

### **Programmatic Usage**
```python
from main import retrieve, generate_answer

# Retrieve relevant contexts
hits = retrieve("battery optimization", k=3)
for hit in hits:
    print(f"Source: {hit['meta']['source']} (score={hit['score']:.3f})")
    print(f"Text: {hit['text'][:200]}...")

# Generate complete answer
answer = generate_answer("How to extend battery life?")
print("Answer:", answer)

# Custom system prompt
import main
main.SYSTEM_PROMPT = "You are a battery optimization expert..."
answer = main.generate_answer("Battery saving tips")
```

---

## 📁 Project Structure

```
78-Simple-RAG-FAISS/
├── main.py                 # Complete RAG implementation
├── pyproject.toml          # Dependencies (uv)
├── .env                    # OpenAI API key
├── .env.example            # Environment template
├── faiss_index/            # Generated index (auto-created)
│   ├── index.faiss         # FAISS vector index
│   └── docs.pkl            # Chunk texts + metadata
└── README.md               # This file
```

---

## 🔬 Technical Details

### **Key Differences from Previous Projects**

| Feature | Project 76 (Basic RAG) | Project 77 (Prompt Builder) | Project 78 (Complete RAG) |
|---------|------------------------|----------------------------|----------------------------|
| **Output** | Raw retrieved chunks | Formatted LLM prompt | **Generated answers** ✨ |
| **LLM Calls** | None (retrieval only) | None (prompt building only) | **Real-time generation** 🤖 |
| **System Prompt** | Not included | Integrated and configurable | **Active in generation** |
| **Response** | Manual interpretation | Manual LLM call required | **Automatic answers** |
| **Use Case** | Understanding RAG basics | Learning prompt engineering | **Production Q&A system** |

### **Complete RAG Pipeline**

```python
def generate_answer(query: str) -> str:
    # 1. Retrieve relevant contexts
    hits = retrieve(query)
    
    # 2. Assemble context
    context = "\n\n".join(h["text"] for h in hits)
    
    # 3. Build user prompt
    user_prompt = f"Context:\n{context}\n\nQuestion: {query}\nAnswer:"
    
    # 4. Generate with LLM
    client = openai.OpenAI()
    resp = client.chat.completions.create(
        model=LLM_MODEL,
        temperature=0.2,  # Low temperature for factual responses
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
    )
    
    return resp.choices[0].message.content.strip()
```

### **Performance Characteristics**

- **Indexing**: ~100 chunks/second (depends on OpenAI API)
- **Retrieval**: <1ms for 1000 chunks (CPU)
- **Generation**: 2-5 seconds (GPT-4o-mini, depends on context size)
- **Memory**: ~6KB per chunk + generation overhead
- **Cost**: ~$0.00015 per 1K input tokens + $0.0006 per 1K output tokens

### **Generation Parameters**

```python
# Optimized for factual, context-bound responses
temperature=0.2  # Low creativity, high accuracy
model="gpt-4o-mini"  # Cost-effective, fast responses
system_prompt="You are a concise, highly accurate assistant..."
```

---

## 🎯 Use Cases

### **Educational**
- 📚 **RAG Learning** - Complete end-to-end RAG demonstration
- 🎓 **LLM Integration** - Understanding retrieval + generation
- 🔍 **Context Utilization** - See how LLMs use retrieved context

### **Development**
- 🛠️ **RAG Prototyping** - Quick RAG system for testing
- 📊 **Context Quality** - Test different chunking strategies
- 🧪 **Prompt Engineering** - Experiment with system prompts

### **Production**
- 💼 **Document Q&A** - Customer support, knowledge bases
- 📖 **Research Assistant** - Academic paper analysis
- 🔧 **Technical Support** - Product documentation queries

---

## 🚀 Next Steps

### **Enhancements**
- [ ] Add conversation memory for multi-turn dialogues
- [ ] Implement context compression for longer documents
- [ ] Add source citations in generated answers
- [ ] Support multiple LLM providers (Claude, Gemini)
- [ ] Add streaming responses for real-time generation

### **Optimization**
- [ ] Implement caching for frequent queries
- [ ] Add relevance filtering for retrieved chunks
- [ ] Use FAISS IVF index for large datasets
- [ ] Add async processing for better performance

### **Advanced Features**
- [ ] Hybrid search (BM25 + vector)
- [ ] Multi-document retrieval strategies
- [ ] Query expansion and reformulation
- [ ] Evaluation metrics and quality scoring

---

## 📚 Dependencies

```toml
numpy = "2.3.1"              # Array operations
PyMuPDF = "1.26.1"           # PDF text extraction
faiss-cpu = "1.11.0"         # Vector search
openai = "1.93.0"            # Embeddings + Chat API
tqdm = "4.67.1"              # Progress bars
python-dotenv = "*"          # Environment variables
```

---

## 🤝 Contributing

This is a learning project demonstrating complete RAG systems. Feel free to:
- Fork and experiment with different LLM models
- Add new document formats (DOCX, HTML, Markdown)
- Implement evaluation metrics
- Share optimization techniques

---

## 📝 License

MIT License - Free to use and modify

---

## 🎓 Learning Resources

- [RAG Systems Explained](https://www.pinecone.io/learn/retrieval-augmented-generation/)
- [FAISS Documentation](https://github.com/facebookresearch/faiss/wiki)
- [OpenAI Chat Completions](https://platform.openai.com/docs/guides/chat)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)

---

**Built with ❤️ as part of the Python AI Projects series**