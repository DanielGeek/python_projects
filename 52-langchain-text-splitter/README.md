# 📄 LangChain Text Splitters: Complete Guide

A comprehensive demonstration of LangChain's text splitting and chunking strategies for optimizing documents in RAG (Retrieval-Augmented Generation) systems.

## 📋 Overview

This project showcases essential text splitting techniques in LangChain, providing hands-on examples for different chunking strategies and their applications in document processing:

- **Recursive Character Splitting**: Intelligent text splitting with configurable overlap
- **Markdown Header Splitting**: Structure-aware splitting based on markdown headers
- **Code Splitting**: Language-specific splitting for code documents
- **Document Splitting**: Processing real PDF documents with metadata preservation
- **Chunk Size Optimization**: Finding optimal chunk sizes for different use cases

## 🎯 Key Features Demonstrated

### 1. **Recursive Character Text Splitting (`recursive_splitter`)**

- **Concept**: Intelligently splits text while maintaining context through overlap
- **Implementation**: `RecursiveCharacterTextSplitter` with customizable separators and overlap
- **Use Case**: General-purpose text splitting for documents, articles, and web content

### 2. **Chunk Size Comparison (`chunk_size_comparison`)**

- **Concept**: Analyzes how different chunk sizes affect document segmentation
- **Implementation**: Comparative analysis with 20% overlap across multiple sizes
- **Use Case**: Optimizing chunk sizes for specific RAG applications and context windows

### 3. **Overlap Importance (`overlap_importance`)**

- **Concept**: Demonstrates how overlap maintains context between chunks
- **Implementation**: Side-by-side comparison of chunking with and without overlap
- **Use Case**: Understanding semantic continuity in document processing

### 4. **Markdown Header Splitting (`markdown_splitter`)**

- **Concept**: Structure-aware splitting based on markdown headers (H1, H2, H3)
- **Implementation**: `MarkdownHeaderTextSplitter` with automatic metadata extraction
- **Use Case**: Processing structured documents while preserving organizational hierarchy

### 5. **Code Splitting (`code_splitter`)**

- **Concept**: Language-specific splitting that respects code structure
- **Implementation**: `RecursiveCharacterTextSplitter.from_language()` for Python code
- **Use Case**: Processing code documentation, tutorials, and technical documentation

### 6. **Document Splitting (`document_splitter`)**

- **Concept**: Real-world PDF processing with metadata preservation
- **Implementation**: `PyPDFLoader` + `RecursiveCharacterTextSplitter` for complete pipeline
- **Use Case**: Processing research papers, manuals, and technical documents

## 🚀 Quick Start

### Prerequisites

- Python 3.14+
- Sample PDF document in `./docs/` directory
- Basic understanding of RAG systems and document processing

### Installation

1. **Clone the repository**

2. **Install dependencies using uv**

```bash
uv sync
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

4. **Add sample PDF document**

```bash
# Place your PDF in the docs directory
# ./docs/your_document.pdf
```

### Running the Examples

```bash
uv run python main.py
```

Edit `main.py` to comment/uncomment the demo functions you wish to run.

## 🛠️ Technical Implementation

### Recursive Character Splitting Example

```python
def recursive_splitter():
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", " ", ""],
    )
    chunks = splitter.split_text(SAMPLE_TEXT)
    
    print(f"Original length: {len(SAMPLE_TEXT)} chars")
    print(f"Number of chunks: {len(chunks)}")
    print(f"Chunk sizes: {[len(c) for c in chunks]}")
```

### Markdown Header Splitting Example

```python
def markdown_splitter():
    headers_to_consider = [
        ("#", "h1"),
        ("##", "h2"),
        ("###", "h3"),
    ]
    splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_consider)
    chunks = splitter.split_text(SAMPLE_TEXT)
    
    for i, chunk in enumerate(chunks):
        print(f"--- Chunk {i + 1} ---")
        print(f" Metadata: {chunk.metadata}")
        print(f" Content: {chunk.page_content[:200]}...")
```

### Code Splitting Example

```python
def code_splitter():
    python_splitter = RecursiveCharacterTextSplitter.from_language(
        language=Language.PYTHON, chunk_size=500, chunk_overlap=50
    )
    chunks = python_splitter.split_text(SAMPLE_CODE)
    
    for i, chunk in enumerate(chunks):
        print(f"\nChunk {i} ({len(chunk)} chars):")
        print(chunk[:150] + "..." if len(chunk) > 150 else chunk)
```

### Document Processing Example

```python
def document_splitter():
    loader = PyPDFLoader("./docs/ai_agents_llms.pdf")
    docs = loader.load()
    
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
    )
    
    split_docs = splitter.split_documents(docs)
    
    print(f"Split into {len(split_docs)} chunks")
    print(f"First chunk metadata: {split_docs[0].metadata}")
    print(f"First chunk content: {split_docs[0].page_content[:200]}...")
```

## 📊 Chunking Strategies Comparison

### Overlap Calculation

The project uses intelligent overlap calculation:

```python
chunk_overlap = size // 5  # 20% overlap using floor division
```

**Why floor division (`//`)?**
- Ensures integer values for chunk parameters
- Consistent behavior across different chunk sizes
- Avoids floating-point precision issues

### Separator Hierarchy

`RecursiveCharacterTextSplitter` uses a priority-based separator system:

```python
separators=["\n\n", "\n", " ", ""]
```

1. **`\n\n`**: Paragraph breaks (highest priority)
2. **`\n`**: Line breaks
3. **` `**: Word boundaries
4. **`""`**: Character-level (last resort)

## 📦 Dependencies

- `langchain`: Core LangChain framework
- `langchain-community`: Community text splitters and loaders
- `langchain-core`: Core Document objects and interfaces
- `python-dotenv`: Environment variable management

## 🎓 Learning Outcomes

- ✅ Master different text splitting strategies in LangChain
- ✅ Understand overlap importance for semantic continuity
- ✅ Optimize chunk sizes for specific use cases
- ✅ Process structured documents with metadata preservation
- ✅ Handle code documents with language-aware splitting
- ✅ Build complete document processing pipelines
- ✅ Integrate with RAG systems and vector databases

## 🔧 Advanced Usage

### Custom Separator Strategies

```python
# Custom separators for specific document types
custom_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=100,
    separators=["\n\n\n", "\n\n", "\n", ". ", " ", ""],
)
```

### Language-Specific Splitting

```python
# Support for multiple programming languages
js_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.JS, chunk_size=500, chunk_overlap=50
)

html_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.HTML, chunk_size=1000, chunk_overlap=100
)
```

### Metadata Enrichment

```python
# Add custom metadata during splitting
def enrich_metadata(docs):
    for i, doc in enumerate(docs):
        doc.metadata.update({
            "chunk_index": i,
            "chunk_type": "text",
            "processing_timestamp": datetime.now().isoformat()
        })
    return docs
```

## 📈 Performance Considerations

### Chunk Size Guidelines

- **Small chunks (200-400)**: Better for specific queries, more retrieval calls
- **Medium chunks (500-800)**: Balanced approach, good for general RAG
- **Large chunks (1000+)**: Better for broad context, fewer retrieval calls

### Overlap Best Practices

- **10-20% overlap**: Good balance between context and redundancy
- **Higher overlap**: Better for complex documents with interdependent sections
- **Lower overlap**: Better for independent sections or keyword matching

## 🚀 Production Features

- **Memory Efficient**: Streaming processing for large documents
- **Metadata Preservation**: Automatic metadata extraction and inheritance
- **Error Resilient**: Comprehensive error handling for malformed documents
- **Flexible Configuration**: Customizable parameters for different use cases
- **Language Support**: Built-in support for 20+ programming languages

---

**Status**: ✅ Complete with working examples for all major splitting strategies  
**Next Steps**: Integration with vector stores and RAG pipeline optimization