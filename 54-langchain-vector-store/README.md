# 🗄️ LangChain Vector Stores: Complete Guide

A comprehensive demonstration of vector store implementations using LangChain with Chroma, covering similarity search, metadata filtering, persistence, and advanced retrieval strategies for RAG applications.

## 📋 Overview

This project showcases essential vector store capabilities in LangChain, providing hands-on examples for building efficient semantic search and retrieval systems:

- **Chroma Vector Store**: Open-source embedding database for AI applications
- **Similarity Search**: Find most relevant documents using vector embeddings
- **Metadata Filtering**: Filter search results by document metadata
- **Persistence**: Save and load vector stores for long-term storage
- **Retrievers**: Convert vector stores to LangChain retrievers for RAG pipelines
- **MMR Search**: Maximal Marginal Relevance for diverse result sets
- **Text Splitting**: Optimize document chunking for better retrieval

## 🎯 Key Features Demonstrated

### 1. **Chroma Vector Store Basics (`chroma_basics`)**

- **Concept**: Create and query vector databases with Chroma
- **Implementation**: `Chroma.from_documents()` with OpenAI embeddings
- **Use Case**: Building semantic search engines and document repositories

### 2. **Similarity Search with Scores (`similarity_search_with_scores`)**

- **Concept**: Retrieve documents with relevance scores
- **Implementation**: `similarity_search_with_score()` with distance metrics
- **Use Case**: Ranking documents by relevance and understanding similarity thresholds

### 3. **Metadata Filtering (`metadata_filtering`)**

- **Concept**: Filter search results using document metadata
- **Implementation**: Filter criteria on `topic`, `source`, or custom fields
- **Use Case**: Scoped search within specific document categories or sources

### 4. **Vector Store Persistence (`persist_chroma`)**

- **Concept**: Save vector stores to disk and reload them
- **Implementation**: `persist_directory` parameter with Chroma
- **Use Case**: Long-term storage and fast startup of large document collections

### 5. **Retriever Patterns (`as_retriever`)**

- **Concept**: Convert vector stores to LangChain retrievers
- **Implementation**: `as_retriever()` with similarity and MMR search types
- **Use Case**: Integration with RAG chains and LLM applications

### 6. **Complete Pipeline Exercise (`exercise_vector_store_setup`)**

- **Concept**: End-to-end vector store setup with text splitting
- **Implementation**: Text → Documents → Chunks → Vector Store → Retriever
- **Use Case**: Production-ready RAG pipeline implementation

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- OpenAI API key (for embeddings)
- Basic understanding of vector embeddings and semantic search

### Installation

1. **Clone the repository**

2. **Install dependencies using uv**

```bash
uv sync
```

3. **Set up environment variables**

```bash
cp .env.example .env
# Add your OpenAI API key to .env file
```

### Running the Examples

```bash
uv run python main.py
```

Edit `main.py` to comment/uncomment the demo functions you wish to run.

## 🛠️ Technical Implementation

### Basic Vector Store Creation

```python
from langchain_chroma import Chroma
from langchain_openai.embeddings import OpenAIEmbeddings
from langchain_core.documents import Document

# Create embeddings model
embeddings_model = OpenAIEmbeddings(model="text-embedding-3-small")

# Sample documents with metadata
documents = [
    Document(
        page_content="Vector stores are databases optimized for storing and searching embeddings.",
        metadata={"source": "vector_guide", "topic": "database"}
    ),
    Document(
        page_content="Chroma is an open-source embedding database for AI applications.",
        metadata={"source": "chroma_docs", "topic": "database"}
    )
]

# Create vector store
vectorstore = Chroma.from_documents(
    documents=documents, 
    embedding=embeddings_model,
    persist_directory="./chroma_db"  # Optional persistence
)
```

### Similarity Search with Scores

```python
def similarity_search_with_scores():
    query = "Explain vector stores."
    results_with_scores = vectorstore.similarity_search_with_score(query, k=3)
    
    print(f"Top 3 results for query: '{query}':")
    for i, (doc, score) in enumerate(results_with_scores):
        print(f"Result {i + 1}: {doc.page_content} (Score: {score:.4f})")
    
    # Note: Lower scores = MORE similar (Chroma uses distance metrics)
```

### Metadata Filtering

```python
def metadata_filtering():
    query = "What databases are available?"
    
    # Filter by metadata
    filter_criteria = {"topic": "database"}
    filtered_results = vectorstore.similarity_search(
        query, k=5, filter=filter_criteria
    )
    
    print("Results with metadata filtering:")
    for doc in filtered_results:
        print(f"{doc.page_content} (Source: {doc.metadata['source']})")
```

### Retriever Patterns

```python
def as_retriever():
    # Similarity retriever
    similarity_retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 3}
    )
    
    # MMR retriever (diverse results)
    mmr_retriever = vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 3, "fetch_k": 5}  # Fetch 5, return 3 diverse
    )
    
    # Use retriever
    docs = similarity_retriever.invoke("How do I build AI applications?")
    mmr_docs = mmr_retriever.invoke("vector databases and embeddings")
```

### Complete Pipeline Exercise

```python
def create_retriever(texts: list[str], chunk_size: int = 500, 
                    chunk_overlap: int = 50, k: int = 3):
    # Create documents from text
    docs = [Document(page_content=t) for t in texts]
    
    # Split into chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size, 
        chunk_overlap=chunk_overlap
    )
    split_docs = splitter.split_documents(docs)
    
    # Create vector store
    vectorstore = Chroma.from_documents(
        documents=split_docs, 
        embedding=embeddings_model
    )
    
    # Return configured retriever
    return vectorstore.as_retriever(
        search_type="similarity", 
        search_kwargs={"k": k}
    )
```

## 📊 Vector Store Comparison

### Chroma vs Other Vector Stores

| Feature | Chroma | FAISS | Pinecone | Weaviate |
|---------|--------|-------|----------|----------|
| **Open Source** | ✅ | ✅ | ❌ | ✅ |
| **Managed Service** | ❌ | ❌ | ✅ | ✅ |
| **Local Storage** | ✅ | ✅ | ❌ | ✅ |
| **Metadata Filtering** | ✅ | Limited | ✅ | ✅ |
| **Persistence** | ✅ | Manual | ✅ | ✅ |
| **Python Support** | ✅ | ✅ | ✅ | ✅ |
| **Learning Curve** | Easy | Medium | Easy | Medium |

### Search Strategies

| Strategy | Use Case | Pros | Cons |
|----------|----------|------|------|
| **Similarity** | Most relevant results | Fast, precise | Can return redundant results |
| **MMR** | Diverse context | Reduces redundancy | Slower, needs tuning |
| **Filtered** | Scoped search | Precise domain results | Requires good metadata |
| **Hybrid** | Best of both worlds | Balanced relevance/coverage | Complex implementation |

## 🧮 Understanding Distance vs Similarity

### Chroma Distance Metrics

```python
# Chroma uses distance (lower = more similar)
results_with_scores = vectorstore.similarity_search_with_score(query, k=3)

# Example output:
# Result 1: 0.6615 (MOST similar - smallest distance)
# Result 2: 1.3054 (Medium similarity)
# Result 3: 1.3443 (LEAST similar - largest distance)
```

### Converting Distance to Similarity

```python
def distance_to_similarity(distance):
    """Convert Chroma distance to similarity score (0-1)"""
    return 1 / (1 + distance)

# Example:
distance = 0.6615
similarity = distance_to_similarity(distance)  # ~0.602
```

## 📦 Dependencies

- `langchain`: Core LangChain framework
- `langchain-chroma`: Chroma vector store integration
- `langchain-openai`: OpenAI embeddings integration
- `langchain-core`: Core LangChain components
- `python-dotenv`: Environment variable management

## 🎓 Learning Outcomes

- ✅ Master Chroma vector store creation and management
- ✅ Implement similarity search with relevance scoring
- ✅ Apply metadata filtering for scoped search results
- ✅ Persist and reload vector stores for long-term storage
- ✅ Convert vector stores to retrievers for RAG pipelines
- ✅ Understand MMR vs similarity search strategies
- ✅ Build complete text-to-retriever pipelines
- ✅ Optimize chunking strategies for better retrieval

## 🔧 Advanced Usage

### Custom Metadata Schemas

```python
# Rich metadata for better filtering
documents = [
    Document(
        page_content="Python machine learning tutorial",
        metadata={
            "source": "ml_guide",
            "topic": "machine_learning",
            "difficulty": "beginner",
            "language": "python",
            "date_added": "2024-01-15"
        }
    )
]

# Complex filtering
filter_criteria = {
    "topic": "machine_learning",
    "difficulty": "beginner"
}
```

### Performance Optimization

```python
# Batch processing for large datasets
def create_vector_store_batch(documents, batch_size=100):
    vectorstore = None
    
    for i in range(0, len(documents), batch_size):
        batch = documents[i:i+batch_size]
        
        if vectorstore is None:
            # Create with first batch
            vectorstore = Chroma.from_documents(batch, embeddings_model)
        else:
            # Add subsequent batches
            vectorstore.add_documents(batch)
    
    return vectorstore
```

### Hybrid Search Implementation

```python
def hybrid_search(vectorstore, query, k=5):
    """Combine similarity and keyword search"""
    # Semantic search
    semantic_results = vectorstore.similarity_search(query, k=k*2)
    
    # Keyword search (if supported)
    # keyword_results = vectorstore.keyword_search(query, k=k*2)
    
    # Combine and rerank
    # combined = rerank_results(semantic_results, keyword_results)
    
    return semantic_results[:k]  # Simplified for example
```

## 📈 Performance Considerations

### Vector Store Optimization

**Chunk Size Impact**:

- **Small chunks (200-300 tokens)**: Better precision, more context
- **Large chunks (800-1000 tokens)**: Faster processing, less context
- **Optimal overlap**: 10-20% of chunk size

**Memory Management**:

- Use persistence for large collections (>10k documents)
- Implement batch processing for ingestion
- Monitor memory usage during similarity search

**Search Performance**:

- Metadata filtering reduces search space significantly
- MMR adds computational overhead but improves diversity
- Consider approximate nearest neighbor for very large datasets

### Scaling Strategies

```python
# For production workloads
class ProductionVectorStore:
    def __init__(self, persist_dir="./vector_db"):
        self.persist_dir = persist_dir
        self.vectorstore = None
        self.embeddings_model = OpenAIEmbeddings()
    
    def load_or_create(self, documents):
        try:
            # Load existing
            self.vectorstore = Chroma(
                persist_directory=self.persist_dir,
                embedding_function=self.embeddings_model
            )
        except:
            # Create new
            self.vectorstore = Chroma.from_documents(
                documents, 
                self.embeddings_model,
                persist_directory=self.persist_dir
            )
    
    def add_documents_batch(self, documents, batch_size=100):
        for i in range(0, len(documents), batch_size):
            batch = documents[i:i+batch_size]
            self.vectorstore.add_documents(batch)
```

## 🚀 Production Features

- **Persistent Storage**: Automatic saving and loading of vector stores
- **Metadata Filtering**: Advanced filtering capabilities for scoped searches
- **Multiple Search Strategies**: Similarity, MMR, and hybrid approaches
- **Batch Processing**: Efficient handling of large document collections
- **Retriever Integration**: Seamless integration with LangChain RAG pipelines
- **Performance Monitoring**: Built-in metrics and query optimization
- **Scalable Architecture**: Designed for production workloads

## 🔍 Real-World Applications

### Document Search System

```python
def build_document_search():
    # Load documents
    documents = load_documents_from_directory("./docs/")
    
    # Create vector store with metadata
    vectorstore = Chroma.from_documents(
        documents,
        embeddings_model,
        persist_directory="./document_db"
    )
    
    # Create retriever with filtering
    retriever = vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 5, "fetch_k": 10}
    )
    
    return retriever
```

### RAG Pipeline Integration

```python
from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI

def create_rag_chain():
    # Create retriever
    retriever = create_retriever(sample_texts)
    
    # Create RAG chain
    llm = ChatOpenAI(model="gpt-4")
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        return_source_documents=True
    )
    
    return qa_chain

# Use the chain
result = qa_chain.invoke({"query": "What's good for web development?"})
print(result["result"])
print("Sources:", [doc.metadata["source"] for doc in result["source_documents"]])
```

---

**Status**: ✅ Complete with working examples for all major vector store operations  
**Next Steps**: Integration with production vector databases (Pinecone, Weaviate) and advanced RAG implementations