# 🎮 AI-Powered Interactive Story Generator

A sophisticated backend API that generates dynamic, branching "choose your own adventure" stories using advanced AI models. Built with modern Python stack, featuring asynchronous processing, structured AI outputs, and real-time job tracking.

## ✨ Key Features

- **🤖 Multi-LLM Support**: Seamless integration with OpenAI GPT and Google Gemini models
- **📊 Asynchronous Processing**: Background task generation with real-time job status tracking
- **🌳 Tree-Based Story Structure**: Complex branching narratives with multiple endings and paths
- **🔒 Type-Safe API**: Full type safety with Pydantic validation and automatic OpenAPI documentation
- **🏗️ Clean Architecture**: Separation of concerns with routers, services, and data layers
- **🍪 Session Management**: Smart cookie-based session handling for user story tracking
- **📝 Structured AI Outputs**: Reliable JSON parsing with Pydantic models for consistent story generation

## 🛠️ Technical Architecture

### Core Technologies

- **FastAPI**: High-performance async web framework with automatic API documentation
- **LangChain**: Advanced AI orchestration framework for LLM integration
- **SQLAlchemy**: Powerful ORM with relationship management and migrations
- **Pydantic**: Data validation and serialization with type hints
- **uv**: Modern Python package manager with dependency resolution

### AI Integration

- **Google Gemini (gemini-2.5-flash)**: Primary LLM for story generation
- **OpenAI GPT-4 Turbo**: Alternative LLM support
- **Structured Output Parsing**: Consistent JSON responses from AI models
- **Prompt Engineering**: Optimized prompts for complex narrative generation

### Database Design

- **Relational Model**: Stories and nodes with foreign key relationships
- **JSON Storage**: Flexible options storage for branching paths
- **Session Tracking**: User session management across story interactions

## 🏛️ Architecture Overview

```text
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FastAPI App   │────│   Background    │────│   AI Models     │
│   (main.py)     │    │   Tasks         │    │   (Gemini/GPT)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Routers   │────│  Story Generator│────│   LangChain     │
│ (story, job)    │    │   Service       │    │   Integration   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Pydantic      │────│   SQLAlchemy    │────│   Database      │
│   Schemas       │    │   ORM           │    │   (SQLite/PG)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- uv package manager
- Google Gemini API key or OpenAI API key

### Installation

1. **Clone and setup**:

   ```bash
   git clone <repository-url>
   cd backend
   uv init .
   ```

2. **Install dependencies**:

   ```bash
   uv sync
   ```

3. **Configure environment**:

   ```bash
   cp .env.template .env
   # Edit .env with your API keys
   ```

4. **Run the server**:

   ```bash
   uv run main.py
   ```

## 📚 API Documentation

### Interactive Documentation

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Key Endpoints

#### Story Generation

```http
POST /api/stories/create
Content-Type: application/json

{
  "theme": "fantasy adventure"
}
```

#### Job Status Tracking

```http
GET /api/jobs/{job_id}
```

#### Complete Story Retrieval

```http
GET /api/stories/{story_id}/complete
```

## 🎯 Core Workflows

### 1. Story Generation Flow

```text
Client Request → Create Job → Background Task → AI Generation → Database Storage → Completion
```

### 2. Story Retrieval Flow

```text
Client Request → Query Database → Build Tree Structure → Return Complete Story
```

## 🧪 Development Commands

```bash
# Install new dependencies
uv add package-name

# Run development server
uv run main.py

# Run with specific host/port
uvicorn main:app --host 0.0.0.0 --port 8000

# Check for security vulnerabilities
uv pip-audit
```

## � Configuration

### Environment Variables

```bash
DATABASE_URL=sqlite:///./database.database
API_PREFIX=/api
DEBUG=True
ALLOWED_ORIGINS=https://localhost:3000,https://localhost:5173
OPENAI_API_KEY="your-openai-key"
GOOGLE_API_KEY="your-gemini-key"
```

### Database Setup

The application automatically creates tables on startup using SQLAlchemy's `create_all()` method.

## 🏆 Project Highlights

### Technical Excellence

- **Type Safety**: Full type hints throughout the codebase
- **Error Handling**: Comprehensive exception handling with proper HTTP status codes
- **Performance**: Async processing prevents blocking operations
- **Scalability**: Clean architecture supports horizontal scaling

### AI/ML Integration

- **Structured Outputs**: Reliable parsing of AI responses using Pydantic
- **Prompt Engineering**: Optimized prompts for consistent story generation
- **Multi-Provider Support**: Easy switching between OpenAI and Google models
- **Recursive Processing**: Complex tree structure generation from AI responses

### API Design

- **RESTful Principles**: Clean, intuitive API design
- **Documentation**: Auto-generated OpenAPI specifications
- **Validation**: Input validation with detailed error messages
- **CORS Support**: Proper cross-origin resource sharing configuration

## 🤝 Contributing

This project follows Python best practices and type safety guidelines. Contributions should maintain:

- Type hints for all functions
- Comprehensive error handling
- Clean architecture principles
- Proper documentation

## 📄 License

This project is licensed under the MIT License.

---

**Built with modern Python stack and AI technologies** 🐍🤖

*Showcasing expertise in FastAPI, AI integration, and clean architecture patterns*
