# 21-RAG-AI

RAG (Retrieval-Augmented Generation) AI application using Google Gemini and LlamaIndex.

## 🚀 Features

- **Google Gemini Integration**: Uses Gemini 1.5 Flash for AI responses
- **LlamaIndex Framework**: Document indexing and retrieval
- **Vector Storage**: Qdrant for vector database
- **FastAPI Backend**: REST API for RAG operations
- **Streamlit UI**: Web interface for document processing

## 📋 Requirements

- Python 3.14+
- Google Gemini API Key

## 🛠️ Setup

1. **Install dependencies**:
```bash
uv sync
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your Google Gemini API key
```

3. **Get Google Gemini API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file

## 🔧 Usage

### Basic RAG Example
```bash
uv run python main.py
# or
uv run uvicorn main:app --reload
```

### Run Inngest
```bash
npx inngest-cli@latest dev -u http://127.0.0.1:8000/api/inngest --no-discovery
```

### Run Qdrant
```bash
docker run -d --name qdrantRagDb -p 6333:6366 -v "$(pwd)/qdrant_storage:/qdrant/storage" qdrant/qdrant
```

### Add Documents
1. Create a `data/` directory
2. Add your documents (PDF, TXT, MD files)
3. Run the application to index them

### API Server
```bash
uv run uvicorn main:app --reload
```

### Streamlit UI
```bash
uv run streamlit run app.py
```

## 📚 Dependencies

- `google-generativeai`: Google Gemini API client
- `llama-index-llms-gemini`: LlamaIndex Gemini integration
- `llama-index-core`: Core LlamaIndex functionality
- `qdrant-client`: Vector database client
- `fastapi`: Web framework
- `streamlit`: Web UI framework

## 🏗️ Architecture

```text
21-RAG-AI/
├── main.py           # Main application entry point
├── data/             # Document storage
├── .env.example      # Environment template
├── pyproject.toml    # Dependencies
└── README.md         # This file
```

## 🤖 Google Gemini Models

- **gemini-1.5-flash**: Fast, efficient for most tasks
- **gemini-1.5-pro**: Advanced reasoning capabilities
- **gemini-pro**: General purpose model

## 📖 Example Usage

```python
import os
from llama_index.llms.gemini import Gemini
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

# Initialize Gemini
llm = GoogleGenAI(model="gemini-2.5-flash", api_key=api_key)

# Load and index documents
documents = SimpleDirectoryReader("data").load_data()
index = VectorStoreIndex.from_documents(documents)

# Query the index
query_engine = index.as_query_engine(llm=llm)
response = query_engine.query("What is this document about?")
```

## 🔍 RAG Workflow

1. **Document Loading**: Load documents from various sources
2. **Text Splitting**: Split documents into chunks
3. **Embedding**: Create vector embeddings using Gemini
4. **Indexing**: Store embeddings in Qdrant vector database
5. **Retrieval**: Find relevant documents for queries
6. **Generation**: Generate responses using Gemini with retrieved context

## 🚀 Deployment

### Docker
```bash
docker build -t rag-ai .
docker run -p 8000:8000 rag-ai
```

### Environment Variables
- `GOOGLE_API_KEY`: Your Google Gemini API key
- `QDRANT_URL`: Qdrant database URL (optional)
- `QDRANT_API_KEY`: Qdrant API key (optional)

---

Built with ❤️ using Google Gemini, LlamaIndex, and FastAPI
