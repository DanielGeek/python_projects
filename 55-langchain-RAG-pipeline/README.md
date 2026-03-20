# 🤖 LangChain RAG Pipeline: Complete Implementation Guide

A comprehensive demonstration of Retrieval-Augmented Generation (RAG) systems using LangChain, showcasing various patterns from basic Q&A to structured outputs with confidence scoring.

## 📋 Overview

This project provides hands-on examples for building production-ready RAG systems that combine document retrieval with language model generation to create accurate, context-aware AI applications.

- **Basic RAG Pipeline**: Foundation pattern with similarity search and context injection
- **Source Attribution**: Track and display document sources for transparency
- **Fallback Handling**: Graceful degradation when context is insufficient
- **Structured Outputs**: Pydantic-based responses with confidence scores
- **Document Q&A System**: Complete reusable class for document analysis
- **LCEL Integration**: Modern LangChain Expression Language patterns

## 🎯 Key Features Demonstrated

### 1. **Basic RAG Pipeline (`demo_basic_rag`)**
- **Concept**: Retrieve relevant documents and generate answers based on context
- **Implementation**: Chroma vector store + similarity search + LLM generation
- **Use Case**: Building knowledge base Q&A systems

### 2. **RAG with Source Attribution (`demo_rag_with_sources`)**
- **Concept**: Track and display which documents contributed to answers
- **Implementation**: Enhanced document formatting with source metadata
- **Use Case**: Research applications requiring citation and verification

### 3. **RAG with Fallback Handling (`demo_rag_with_fallback`)**
- **Concept**: Handle questions outside the knowledge base gracefully
- **Implementation**: Prompt engineering for safe responses
- **Use Case**: Production systems requiring reliability and safety

### 4. **Structured RAG Outputs (`demo_structured_rag`)**
- **Concept**: Generate structured responses with confidence metrics
- **Implementation**: Pydantic models + structured LLM outputs
- **Use Case**: Enterprise applications requiring structured data

### 5. **Document Q&A System (`exercise_document_qa`)**
- **Concept**: Reusable class for document analysis and Q&A
- **Implementation**: Complete encapsulated RAG system
- **Use Case**: Production document processing pipelines

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- OpenAI API key (for embeddings and LLM)
- Basic understanding of vector databases and RAG concepts

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

### Basic RAG Pipeline

```python
from langchain_core.runnables import RunnablePassthrough
from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter

def create_rag_pipeline():
    # 1. Document Processing
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents([document])
    
    # 2. Vector Store Creation
    vector_store = Chroma.from_documents(chunks, embeddings_model)
    retriever = vector_store.as_retriever(search_kwargs={"k": 2})
    
    # 3. RAG Chain with LCEL
    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    
    return rag_chain
```

### Source Attribution

```python
def format_docs_with_sources(docs):
    formatted = []
    for i, doc in enumerate(docs):
        source = doc.metadata.get("source", "unknown")
        formatted.append(f"[{i + 1}] {source}:\n{doc.page_content}")
    return "\n\n".join(formatted)

# Enhanced prompt for source tracking
prompt = ChatPromptTemplate.from_template("""
    Answer the question based on the context below. Include which sources you used.
    
    Context: {context}
    Question: {question}
    Answer (include sources):
""")
```

### Structured Outputs with Pydantic

```python
from pydantic import BaseModel, Field
from typing import List

class RAGResponse(BaseModel):
    """Structured RAG response with metadata."""
    answer: str = Field(description="The answer to the question")
    confidence: str = Field(description="high, medium, or low")
    sources_used: List[str] = Field(description="List of sources referenced")
    follow_up: str = Field(description="Suggested follow-up question")

# Configure LLM for structured output
structured_llm = llm.with_structured_output(RAGResponse)
```

### Reusable Document Q&A Class

```python
class DocumentQA:
    def __init__(self, document: str, source_name: str = "document"):
        # Process document
        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        doc = Document(page_content=document, metadata={"source": source_name})
        chunks = splitter.split_documents([doc])
        
        # Create vector store and retriever
        self.vector_store = Chroma.from_documents(chunks, embeddings_model)
        self.retriever = self.vector_store.as_retriever(search_kwargs={"k": 3})
        
        # Build RAG chain
        self.chain = self._build_chain()
    
    def ask(self, question: str) -> str:
        """Ask a question about the document."""
        return self.chain.invoke(question)
```

## 📊 RAG Pipeline Architecture

### Data Flow

```
Input Question
       ↓
Vector Embedding
       ↓
Similarity Search (k documents)
       ↓
Document Retrieval
       ↓
Context Formatting
       ↓
Prompt Template Injection
       ↓
LLM Generation
       ↓
Structured Output
       ↓
Final Answer
```

### Key Components

| Component | Purpose | Implementation |
|-----------|---------|----------------|
| **Document Splitter** | Break large docs into searchable chunks | `RecursiveCharacterTextSplitter` |
| **Vector Store** | Store and search document embeddings | `Chroma` with OpenAI embeddings |
| **Retriever** | Find relevant documents | `vector_store.as_retriever()` |
| **Prompt Template** | Structure context and question | `ChatPromptTemplate` |
| **LLM** | Generate answers from context | `gpt-4o-mini` |
| **Output Parser** | Structure final response | `StrOutputParser` or Pydantic |

## 🧮 Understanding RunnablePassthrough

`RunnablePassthrough()` is essential for RAG pipelines:

```python
rag_chain = (
    {
        "context": retriever | format_docs,      # Processed context
        "question": RunnablePassthrough()        # Original question
    }
    | prompt
    | llm
)

# Input: "What is LangChain?"
# Output: {
#     "context": "LangChain is a framework...",
#     "question": "What is LangChain?"
# }
```

**Purpose**: Pass the original question through unchanged while processing other components.

## 📈 Performance Optimization

### Chunking Strategies

```python
# For technical documentation
technical_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,    # Larger chunks for technical content
    chunk_overlap=100,
    separators=["\n## ", "\n### ", "\n", " ", ""]
)

# For conversational content
conversation_splitter = RecursiveCharacterTextSplitter(
    chunk_size=300,    # Smaller chunks for Q&A
    chunk_overlap=50
)
```

### Retrieval Optimization

```python
# Similarity search (default)
retriever = vector_store.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 3}
)

# MMR for diverse results
retriever = vector_store.as_retriever(
    search_type="mmr",
    search_kwargs={"k": 3, "fetch_k": 10}
)

# Similarity score threshold
retriever = vector_store.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"score_threshold": 0.7, "k": 3}
)
```

### Prompt Engineering for RAG

```python
# Context-focused prompt
context_prompt = ChatPromptTemplate.from_template("""
    Answer ONLY using the provided context. If the context doesn't contain 
    the answer, say "I don't have enough information to answer this."
    
    Context:
    {context}
    
    Question: {question}
    
    Answer:
""")

# Confidence-aware prompt
confidence_prompt = ChatPromptTemplate.from_template("""
    Based on the context, answer the question and rate your confidence.
    
    Context: {context}
    Question: {question}
    
    Format your response as:
    [Confidence: high/medium/low] Your answer here
""")
```

## 🔧 Advanced Patterns

### Multi-Document RAG

```python
def create_multi_document_rag(documents: List[Document]):
    # Process multiple documents with source tracking
    all_chunks = []
    for i, doc in enumerate(documents):
        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        chunks = splitter.split_documents([doc])
        for chunk in chunks:
            chunk.metadata["source"] = f"doc_{i+1}"
            all_chunks.append(chunk)
    
    vector_store = Chroma.from_documents(all_chunks, embeddings_model)
    return vector_store.as_retriever(search_kwargs={"k": 5})
```

### Streaming RAG Responses

```python
def create_streaming_rag():
    prompt = ChatPromptTemplate.from_template("""
        Based on the context, answer the question.
        
        Context: {context}
        Question: {question}
        
        Answer:
    """)
    
    streaming_llm = ChatOpenAI(model="gpt-4o-mini", streaming=True)
    
    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | streaming_llm
        | StrOutputParser()
    )
    
    return rag_chain

# Usage
for chunk in rag_chain.stream("What is LangChain?"):
    print(chunk, end="", flush=True)
```

### RAG with Memory

```python
from langchain_core.messages import HumanMessage, AIMessage
from langchain.chains import ConversationBufferMemory

def create_conversational_rag():
    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Answer questions based on the provided context."),
        ("human", "{context}\n\nQuestion: {question}"),
        ("human", "{chat_history}")
    ])
    
    rag_chain = (
        {
            "context": retriever | format_docs,
            "question": RunnablePassthrough(),
            "chat_history": lambda x: memory.chat_memory.messages
        }
        | prompt
        | llm
    )
    
    return rag_chain
```

## 📦 Dependencies

- `langchain`: Core LangChain framework and LCEL
- `langchain-chroma`: Chroma vector database integration
- `langchain-openai`: OpenAI embeddings and chat models
- `langchain-core`: Core LangChain components and runnables
- `python-dotenv`: Environment variable management
- `pydantic`: Data validation and structured outputs

## 🎓 Learning Outcomes

- ✅ Master RAG pipeline architecture and implementation
- ✅ Implement document processing and chunking strategies
- ✅ Build vector stores with similarity search capabilities
- ✅ Create structured outputs with confidence scoring
- ✅ Handle fallback scenarios and edge cases
- ✅ Design reusable RAG components and classes
- ✅ Optimize retrieval strategies for different use cases
- ✅ Integrate source attribution and citation tracking

## 🔧 Production Considerations

### Scalability

```python
class ProductionRAG:
    def __init__(self, persist_directory="./vector_db"):
        self.persist_directory = persist_directory
        self.vector_store = None
        self.retriever = None
        self.chain = None
    
    def initialize(self, documents: List[Document]):
        """Initialize or load vector store."""
        try:
            # Load existing vector store
            self.vector_store = Chroma(
                persist_directory=self.persist_directory,
                embedding_function=embeddings_model
            )
        except:
            # Create new vector store
            self.vector_store = Chroma.from_documents(
                documents,
                embeddings_model,
                persist_directory=self.persist_directory
            )
        
        self.retriever = self.vector_store.as_retriever(
            search_type="mmr",
            search_kwargs={"k": 5, "fetch_k": 20}
        )
        
        self.chain = self._build_chain()
    
    def add_documents(self, documents: List[Document]):
        """Add new documents to existing vector store."""
        self.vector_store.add_documents(documents)
```

### Error Handling

```python
def safe_rag_invoke(chain, question: str, max_retries: int = 3):
    """Safe RAG invocation with retry logic."""
    for attempt in range(max_retries):
        try:
            result = chain.invoke(question)
            return result
        except Exception as e:
            if attempt == max_retries - 1:
                return f"I apologize, but I'm experiencing technical difficulties. Please try again later."
            time.sleep(2 ** attempt)  # Exponential backoff
```

### Monitoring and Analytics

```python
import time
from typing import Dict, Any

class MonitoredRAG:
    def __init__(self, rag_chain):
        self.rag_chain = rag_chain
        self.query_count = 0
        self.total_response_time = 0
    
    def invoke(self, question: str) -> Dict[str, Any]:
        """Invoke RAG with monitoring."""
        start_time = time.time()
        
        try:
            answer = self.rag_chain.invoke(question)
            response_time = time.time() - start_time
            
            # Update metrics
            self.query_count += 1
            self.total_response_time += response_time
            
            return {
                "answer": answer,
                "response_time": response_time,
                "query_count": self.query_count,
                "avg_response_time": self.total_response_time / self.query_count
            }
        except Exception as e:
            return {
                "error": str(e),
                "response_time": time.time() - start_time
            }
```

## 🚀 Real-World Applications

### Customer Support Bot

```python
def create_support_rag(faq_documents: List[Document]):
    """RAG system for customer support."""
    prompt = ChatPromptTemplate.from_template("""
        You are a helpful customer support assistant. Answer the question 
        based on the FAQ context. Be polite and professional.
        
        FAQ Context:
        {context}
        
        Customer Question: {question}
        
        Support Response:
    """)
    
    retriever = Chroma.from_documents(faq_documents, embeddings_model).as_retriever(
        search_kwargs={"k": 3}
    )
    
    return (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
```

### Research Assistant

```python
def create_research_rag(papers: List[Document]):
    """RAG system for academic research."""
    class ResearchResponse(BaseModel):
        answer: str = Field(description="Research-based answer")
        citations: List[str] = Field(description="Paper references")
        confidence: str = Field(description="Confidence in answer")
        related_topics: List[str] = Field(description="Suggested related topics")
    
    structured_llm = llm.with_structured_output(ResearchResponse)
    
    prompt = ChatPromptTemplate.from_template("""
        As a research assistant, answer the question based on the provided papers.
        Include proper citations and assess confidence in your answer.
        
        Papers:
        {context}
        
        Research Question: {question}
    """)
    
    retriever = Chroma.from_documents(papers, embeddings_model).as_retriever(
        search_type="mmr",
        search_kwargs={"k": 5, "fetch_k": 15}
    )
    
    return (
        {"context": retriever | format_docs_with_citations, "question": RunnablePassthrough()}
        | prompt
        | structured_llm
    )
```

---

**Status**: ✅ Complete with production-ready RAG patterns and implementations  
**Next Steps**: Integration with document loaders, advanced retrieval strategies, and deployment optimizations