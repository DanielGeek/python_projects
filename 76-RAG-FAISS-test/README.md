# 🔍 RAG with FAISS - Document Retrieval System

A **lightweight and efficient RAG (Retrieval-Augmented Generation) system** using FAISS vector search and OpenAI embeddings. Built for fast semantic search over PDF and text documents with minimal dependencies.

[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/downloads/)
[![FAISS](https://img.shields.io/badge/FAISS-1.11.0-green.svg)](https://github.com/facebookresearch/faiss)
[![OpenAI](https://img.shields.io/badge/OpenAI-Embeddings-orange.svg)](https://platform.openai.com/docs/guides/embeddings)

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
- 🚀 **Fast Retrieval** - Cosine similarity via inner product (L2-normalized)
- 💾 **Persistent Storage** - Index and metadata saved to disk
- 🎯 **Smart Chunking** - Configurable chunk size with overlap
- 📊 **Relevance Scoring** - Returns similarity scores for each result

### **Technical Features**
- ✅ OpenAI `text-embedding-3-small` embeddings
- ✅ FAISS IndexFlatIP (cosine similarity via inner product)
- ✅ PyMuPDF for PDF text extraction
- ✅ Batch embedding processing (100 texts per batch)
- ✅ L2 normalization for efficient cosine search
- ✅ Simple character-based text splitting with overlap

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    RAG RETRIEVAL PIPELINE                    │
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
cd 76-RAG-FAISS-test

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
# Build index and start querying
python main.py

# Interactive query interface
Query (or 'exit'): How do I reset my device?
```

---

## 🔧 How It Works

### **1. Document Loading**
```python
# Extracts text from PDFs using PyMuPDF
docs = load_documents("documents/")
# Returns: [{"text": "...", "metadata": {"source": "file.pdf"}}, ...]
```

### **2. Text Chunking**
```python
# Splits text into overlapping chunks
chunks = split_text(text, size=500, overlap=100)
# Example: "This is a long document..." → ["This is a...", "...a long...", "...document..."]
```

### **3. Embedding Generation**
```python
# Generates OpenAI embeddings in batches
embeddings = embed_texts(chunks)  # Returns (n, 1536) float32 array
faiss.normalize_L2(embeddings)    # L2 normalize for cosine similarity
```

### **4. FAISS Indexing**
```python
# Creates FAISS index for fast similarity search
index = faiss.IndexFlatIP(embedding_dim)  # Inner Product = Cosine (after L2 norm)
index.add(embeddings)
faiss.write_index(index, "faiss_index/index.faiss")
```

### **5. Retrieval**
```python
# Query and retrieve top-k similar chunks
results = retrieve("How to reset device?", k=3)
# Returns: [{"text": "...", "meta": {...}, "score": 0.89}, ...]
```

---

## ⚙️ Configuration

Edit these constants in `main.py`:

```python
DB_DIR = "faiss_index"              # Index storage directory
CHUNK_SIZE = 500                    # Characters per chunk
CHUNK_OVERLAP = 100                 # Overlap between chunks
EMB_MODEL = "text-embedding-3-small" # OpenAI embedding model
```

**Embedding Models:**
- `text-embedding-3-small` - 1536 dimensions, $0.02/1M tokens
- `text-embedding-3-large` - 3072 dimensions, $0.13/1M tokens
- `text-embedding-ada-002` - 1536 dimensions (legacy)

---

## 💻 Usage

### **Interactive Mode**
```bash
python main.py

Query (or 'exit'): What are the main features?

[1] s22_manual.pdf  (score=0.892)
The device includes advanced camera features, 5G connectivity...
------------------------------------------------------------

[2] s22_manual.pdf  (score=0.845)
Main specifications: 6.1" display, Snapdragon 8 Gen 1...
------------------------------------------------------------
```

### **Programmatic Usage**
```python
from main import retrieve

# Retrieve top 5 results
results = retrieve("battery life tips", k=5)

for hit in results:
    print(f"Source: {hit['meta']['source']}")
    print(f"Score: {hit['score']:.3f}")
    print(f"Text: {hit['text'][:200]}...")
```

---

## 📁 Project Structure

```
76-RAG-FAISS-test/
├── main.py                 # Main RAG implementation
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

### **FAISS Index Type**
- **IndexFlatIP** - Inner Product similarity
- **Why IP instead of L2?** After L2 normalization, inner product = cosine similarity
- **Advantage:** Faster than computing cosine directly
- **Trade-off:** Exact search (no approximation) - suitable for small-medium datasets

### **Embedding Pipeline**
```python
1. Text → OpenAI API (batches of 100)
2. Raw embeddings → L2 normalization
3. Normalized vectors → FAISS index
4. Query → Same pipeline → Search
```

### **Chunking Strategy**
- **Character-based:** Simple and fast
- **Overlap:** Prevents context loss at chunk boundaries
- **Size:** 500 chars ≈ 125 tokens (avg)
- **Alternative:** Use LangChain's RecursiveCharacterTextSplitter for smarter splitting

### **Performance**
- **Indexing:** ~100 chunks/second (depends on OpenAI API)
- **Search:** <1ms for 1000 chunks (CPU)
- **Memory:** ~6KB per chunk (1536-dim float32 embedding)

---

## 🎯 Use Cases

- 📚 **Document Q&A** - Answer questions from manuals, reports, books
- 🔍 **Knowledge Base Search** - Semantic search over company docs
- 📄 **Research Assistant** - Find relevant passages in papers
- 💼 **Customer Support** - Retrieve relevant help articles
- 📖 **Study Aid** - Search through textbooks and notes

---

## 🚀 Next Steps

### **Enhancements**
- [ ] Add LLM-powered answer generation (RAG completion)
- [ ] Implement re-ranking with cross-encoder
- [ ] Add metadata filtering (date, source, category)
- [ ] Support more formats (DOCX, HTML, Markdown)
- [ ] Implement hybrid search (BM25 + vector)
- [ ] Add evaluation metrics (DeepEval, RAGAS)

### **Optimization**
- [ ] Use FAISS IVF index for large datasets (>100K chunks)
- [ ] Implement async embedding generation
- [ ] Add caching for frequent queries
- [ ] GPU acceleration with `faiss-gpu`

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

This is a learning project demonstrating RAG fundamentals. Feel free to:
- Fork and experiment
- Add new features
- Optimize performance
- Share improvements

---

## 📝 License

MIT License - Free to use and modify

---

## 🎓 Learning Resources

- [FAISS Documentation](https://github.com/facebookresearch/faiss/wiki)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [RAG Explained](https://www.pinecone.io/learn/retrieval-augmented-generation/)
- [Vector Search Basics](https://www.pinecone.io/learn/vector-search/)

---

**Built with ❤️ as part of the Python AI Projects series**
