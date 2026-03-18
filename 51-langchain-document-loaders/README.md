# 📄 LangChain Document Loaders: Complete Guide

A comprehensive demonstration of LangChain's document loading capabilities, covering various file formats and sources for building document-based AI applications.

## 📋 Overview

This project showcases the essential document loaders in LangChain, providing hands-on examples for loading and processing different types of documents:

- **Text Files**: Local text file loading with metadata extraction
- **Web Content**: HTML scraping from websites using WebBaseLoader
- **Directory Loading**: Bulk processing of multiple files with lazy loading
- **PDF Documents**: PDF parsing with page-by-page content extraction
- **Document Structure**: Understanding LangChain's Document objects and metadata

## 🎯 Key Features Demonstrated

### 1. **Text File Loading (`load_text_file`)**

- **Concept**: Load and parse local text files into LangChain Document objects
- **Implementation**: `TextLoader` with automatic encoding detection
- **Use Case**: Processing configuration files, logs, or plain text documents

### 2. **Web Content Scraping (`web_loader`)**

- **Concept**: Extract clean text content from web pages
- **Implementation**: `WebBaseLoader` with BeautifulSoup parsing
- **Use Case**: Loading documentation, articles, or web-based content

### 3. **Directory Bulk Processing (`lazy_loader`)**

- **Concept**: Process multiple files efficiently with lazy loading
- **Implementation**: `DirectoryLoader` with glob patterns and lazy loading
- **Use Case**: Batch processing document collections, corpora, or datasets

### 4. **PDF Document Parsing (`pdf_loader`)**

- **Concept**: Extract text content from PDF files page by page
- **Implementation**: `PyPDFLoader` with automatic page segmentation
- **Use Case**: Processing research papers, manuals, or reports

### 5. **Document Structure Management (`doc_structure`)**

- **Concept**: Create and manipulate LangChain Document objects
- **Implementation**: Direct Document creation with custom metadata
- **Use Case**: Custom document creation, metadata enrichment, and content modification

## 🚀 Quick Start

### Prerequisites

- Python 3.14+
- Basic understanding of file systems and document formats

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

### Running the Examples

```bash
uv run python main.py
```

Edit `main.py` to comment/uncomment the demo functions you wish to run.

## 🛠️ Technical Implementation

### Text File Loading Example

```python
def load_text_file():
    # Create a temporary text file for demonstration
    with tempfile.NamedTemporaryFile(delete=False, suffix=".txt") as temp_file:
        temp_file.write(b"Hello, this is a sample text file.")
        temp_file_path = temp_file.name

    try:
        # Load the text file using TextLoader
        loader = TextLoader(temp_file_path)
        documents = loader.load()
        
        print(f"Loaded {len(documents)} document(s)")
        print(f"Content preview: {documents[0].page_content[:100]}...")
        print(f"Metadata: {documents[0].metadata}")
    finally:
        os.remove(temp_file_path)  # Clean up
```

### Web Content Scraping Example

```python
def web_loader():
    loader = WebBaseLoader(
        "https://python.langchain.com/docs/introduction/",
        bs_kwargs={"parse_only": None},
    )
    
    documents = loader.load()
    
    print(f"Loaded {len(documents)} document(s) from web")
    print(f"Source: {documents[0].metadata.get('source', 'N/A')}")
    print(f"Content length: {len(documents[0].page_content)} characters")
```

### Directory Processing with Lazy Loading

```python
def lazy_loader():
    loader = DirectoryLoader(tempdir, glob="*.txt", loader_cls=TextLoader)
    
    print("Initialized lazy loader for directory:", tempdir)
    for doc in loader.lazy_load():
        print("Document Content Preview:", doc.page_content[:50], "...")
        print("Metadata:", doc.metadata["source"])
```

### PDF Document Processing

```python
def pdf_loader(pdf_path: str):
    loader = PyPDFLoader(pdf_path)
    documents = loader.load()
    
    print(f"Loaded {len(documents)} document(s) from PDF")
    for i, doc in enumerate(documents):
        print(f"Document {i + 1} Content Preview: {doc.page_content[:100]}...")
        print(f"Metadata: {doc.metadata}")
```

## 📊 Document Object Structure

LangChain's Document objects have two main components:

```python
doc = Document(
    page_content="This is the actual text content of the document.",
    metadata={
        "source": "file_path_or_url",
        "author": "Document author",
        "created_at": "2026-03-17",
        "tags": ["tag1", "tag2"],
        # Custom metadata fields can be added
    }
)
```

### Key Metadata Fields

- **source**: File path or URL where the document originated
- **page**: Page number (for multi-page documents like PDFs)
- **title**: Document title (when available)
- **author**: Document author or creator
- **created_at**: Timestamp of document creation

## 📦 Dependencies

- `langchain`: Core LangChain framework
- `langchain-community`: Community document loaders
- `langchain-core`: Core Document objects and interfaces
- `pypdf`: PDF parsing capabilities
- `bs4`: BeautifulSoup for HTML parsing
- `python-dotenv`: Environment variable management

## 🎓 Learning Outcomes

- ✅ Master different document loading techniques in LangChain
- ✅ Understand Document object structure and metadata management
- ✅ Implement efficient bulk processing with lazy loading
- ✅ Extract content from various file formats (text, PDF, HTML)
- ✅ Build document processing pipelines for RAG applications
- ✅ Handle web scraping and content extraction from websites
- ✅ Create custom documents with enriched metadata

## 🔧 Advanced Usage

### Custom Document Processing

```python
# Create documents with custom metadata
custom_doc = Document(
    page_content="Processed content",
    metadata={
        "source": "processed_doc.txt",
        "processing_date": datetime.now().isoformat(),
        "word_count": len(content.split()),
        "language": "en",
        "category": "technical"
    }
)
```

### Error Handling

```python
try:
    loader = TextLoader(file_path)
    documents = loader.load()
except Exception as e:
    print(f"Error loading document: {e}")
    # Implement fallback logic
```

### Directory Filtering

```python
# Load specific file types
loader = DirectoryLoader(
    "./documents",
    glob="*.pdf",  # Only PDF files
    loader_cls=PyPDFLoader,
    recursive=True,  # Include subdirectories
    show_progress=True  # Show loading progress
)
```

## 🚀 Production Features

- **Memory Efficient**: Lazy loading for large document collections
- **Error Resilient**: Comprehensive error handling and validation
- **Flexible**: Support for multiple file formats and sources
- **Metadata Rich**: Automatic and custom metadata extraction
- **Scalable**: Batch processing capabilities for enterprise use

---

**Status**: ✅ Complete with working examples for all major document loaders  
**Next Steps**: Integration with vector stores and RAG pipelines