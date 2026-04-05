# 🚀 Production-Ready LangGraph API

A **production-grade FastAPI application** powered by LangGraph, featuring enterprise-level security, caching, observability, and comprehensive testing. Built with modern Python best practices and ready for deployment.

**🌐 Live Demo:** [https://langchain-production-api.onrender.com/docs](https://langchain-production-api.onrender.com/docs)

[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)](https://fastapi.tiangolo.com)
[![LangChain](https://img.shields.io/badge/LangChain-latest-orange.svg)](https://langchain.com)
[![Tests](https://img.shields.io/badge/tests-27%20passing-brightgreen.svg)](tests/)
[![Code Style](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Online-success.svg)](https://langchain-production-api.onrender.com/docs)

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Security](#-security)
- [Monitoring](#-monitoring)
- [Development](#-development)

---

## ✨ Features

### 🔒 **Security Pipeline**
- **Input Sanitization**: Blocks prompt injection attacks
- **PII Detection & Masking**: Automatically redacts emails, phones, SSNs, credit cards
- **Output Validation**: Prevents leakage of sensitive information
- **Harmful Content Filtering**: Blocks malicious responses

### ⚡ **Performance & Caching**
- **Response Caching**: LRU cache with configurable TTL (default: 5 minutes)
- **Cache Hit Tracking**: Monitor cache performance with `/cache/stats`
- **Zero-latency cached responses**: Instant replies for repeated queries

### 🤖 **LangGraph Agent**
- **Retry Logic**: Automatic retries with exponential backoff (max 3 attempts)
- **Model Fallback**: Primary → Fallback model on failures
- **State Management**: Conversation threading with `thread_id`
- **LangSmith Tracing**: Full observability of agent execution

### 📊 **Observability**
- **Structured Logging**: JSON logs with contextual metadata
- **Metrics Collection**: Request counts, latency, errors, cache hits
- **Health Checks**: `/health` endpoint for Docker/Kubernetes
- **LangSmith Integration**: Trace every LLM call

### 🛡️ **Rate Limiting**
- **Configurable Limits**: Default 20 requests/minute
- **Per-IP Tracking**: Prevents abuse
- **Graceful 429 Responses**: Clear error messages

### 🧪 **Comprehensive Testing**
- **27 Passing Tests**: Unit + Integration tests
- **Dependency Injection**: Clean, testable architecture
- **Pytest Markers**: Separate fast unit tests from integration tests
- **90%+ Code Coverage**: Thoroughly tested codebase

---

## 🏗️ Architecture

### **Design Patterns**

#### **Dependency Injection**
```python
@lru_cache()
def get_security() -> SecurityPipeline:
    """Singleton security pipeline."""
    return SecurityPipeline()

@app.post("/chat")
async def chat(
    security: SecurityPipeline = Depends(get_security),
    cache: ResponseCache = Depends(get_cache),
    metrics: MetricsCollector = Depends(get_metrics_collector),
    agent: ProductionAgent = Depends(get_agent),
):
    # Clean, testable, no global state
```

#### **Request Flow**
```
Client Request
    ↓
Rate Limiter (slowapi)
    ↓
Security Check (injection detection + PII masking)
    ↓
Cache Lookup
    ↓ (cache miss)
LangGraph Agent (with retries + fallback)
    ↓
Output Validation (PII masking + harmful content filter)
    ↓
Cache Store
    ↓
Metrics Recording
    ↓
Response to Client
```

### **Tech Stack**

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | FastAPI 0.115+ | High-performance async API |
| **Agent** | LangGraph | Stateful LLM workflows |
| **LLM** | OpenAI GPT-4o-mini | Primary & fallback models |
| **Caching** | Python LRU Cache | In-memory response caching |
| **Rate Limiting** | slowapi | Per-IP request throttling |
| **Logging** | structlog | Structured JSON logging |
| **Tracing** | LangSmith | LLM observability |
| **Validation** | Pydantic v2 | Request/response validation |
| **Testing** | pytest | Unit + integration tests |
| **Package Manager** | uv | Fast Python package installer |

---

## 🚀 Quick Start

### **Prerequisites**
- Python 3.12+
- [uv](https://github.com/astral-sh/uv) package manager
- OpenAI API key
- (Optional) LangSmith API key for tracing

### **1. Clone & Install**
```bash
cd 75-langchain-production-API
uv sync
```

### **2. Configure Environment**
```bash
cp .env.example .env
# Edit .env with your API keys
```

Required variables:
```env
OPENAI_API_KEY=sk-...
LANGSMITH_API_KEY=lsv2_pt_...  # Optional
APP_ENV=development
LOG_LEVEL=INFO
```

### **3. Run Development Server**
```bash
uv run uvicorn app.main:app --reload --port 8000
```

API available at: **http://localhost:8000**
- Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### **4. Test the API**
```bash
# Health check
curl http://localhost:8000/health

# Chat request
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is LangGraph?", "thread_id": "demo-1"}'
```

---

## ⚙️ Configuration

### **Environment Variables**

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | *required* | OpenAI API key |
| `LANGSMITH_API_KEY` | *required* | LangSmith API key (optional) |
| `APP_ENV` | `development` | Environment: `development` or `production` |
| `LOG_LEVEL` | `INFO` | Logging level: `DEBUG`, `INFO`, `WARNING`, `ERROR` |
| `PRIMARY_MODEL` | `gpt-4o-mini` | Primary OpenAI model |
| `FALLBACK_MODEL` | `gpt-4o-mini` | Fallback model on errors |
| `RATE_LIMIT` | `20/minute` | Rate limit per IP |
| `CACHE_TTL_SECONDS` | `300` | Cache TTL (5 minutes) |
| `MAX_RETRIES` | `3` | Max retry attempts for LLM calls |
| `LANGCHAIN_TRACING_V2` | `false` | Enable LangSmith tracing |
| `LANGSMITH_PROJECT` | `production-api` | LangSmith project name |

### **Configuration File**
See `app/config.py` for all settings with type hints and validation.

---

## 📡 API Endpoints

### **Chat Endpoint**
```http
POST /chat
Content-Type: application/json

{
  "message": "What is machine learning?",
  "thread_id": "user-123"  // Optional, defaults to "default"
}
```

**Response:**
```json
{
  "response": "Machine learning is...",
  "thread_id": "user-123",
  "model_used": "gpt-4o-mini",
  "cached": false,
  "processing_time_ms": 1234.56,
  "timestamp": "2026-04-04T23:00:00Z",
  "security_notes": ["PII masked: email"]
}
```

**Status Codes:**
- `200`: Success
- `400`: Security block (prompt injection, harmful content)
- `422`: Validation error (missing/invalid fields)
- `429`: Rate limit exceeded
- `500`: Server error

### **Health Check**
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "environment": "production",
  "version": "1.2.0",
  "checks": {
    "agent": true,
    "security": true,
    "cache": true
  }
}
```

### **Metrics**
```http
GET /metrics
```

**Response:**
```json
{
  "total_requests": 1523,
  "total_errors": 5,
  "cache_hits": 342,
  "cache_misses": 1181,
  "avg_latency_ms": 1234.56
}
```

### **Cache Statistics**
```http
GET /cache/stats
```

**Response:**
```json
{
  "size": 42,
  "hits": 342,
  "misses": 1181,
  "hit_rate": 0.224
}
```

---

## 🧪 Testing

### **Run All Tests**
```bash
uv run pytest tests/ -v
```

### **Run Unit Tests Only** (fast, no API keys needed)
```bash
uv run pytest tests/ -v -m "not integration"
```

### **Run Integration Tests** (requires `OPENAI_API_KEY`)
```bash
export OPENAI_API_KEY=sk-...
uv run pytest tests/ -v -m integration
```

### **Test Coverage**
```bash
uv run pytest tests/ --cov=app --cov-report=html
open htmlcov/index.html
```

### **Test Structure**
```
tests/
├── pytest.ini              # Pytest configuration
├── test_api.py            # API endpoint tests (27 tests)
├── test_security.py       # Security pipeline tests
└── test_cache.py          # Cache functionality tests
```

**Test Categories:**
- ✅ **Health Endpoint** (4 tests)
- ✅ **Metrics Endpoint** (3 tests)
- ✅ **Cache Stats** (3 tests)
- ✅ **Chat Endpoint** (9 tests: 6 unit + 3 integration)
- ✅ **Error Handling** (4 tests)
- ✅ **OpenAPI Docs** (4 tests)
- ⏭️ **Rate Limiting** (2 skipped - requires real server)

---

## 🐳 Deployment

### **Docker Compose** (Recommended for local)
```bash
# Build and run
docker compose up --build

# Run in background
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

### **Docker (Standalone)**
```bash
# Build
docker build -t langgraph-api .

# Run
docker run -p 8000:8000 \
  -e OPENAI_API_KEY=sk-... \
  -e APP_ENV=production \
  langgraph-api
```

### **Render.com** (One-click deploy)
1. Push code to GitHub
2. Create `render.yaml` (already included)
3. Connect Render to your repo
4. Set environment variables in Render dashboard
5. Deploy!

**render.yaml** is pre-configured with:
- Python 3.12
- Auto-deploy on push
- Health check on `/health`
- Environment variables template

### **Production Checklist**
- [ ] Set `APP_ENV=production`
- [ ] Configure `OPENAI_API_KEY` as secret
- [ ] Enable `LANGCHAIN_TRACING_V2=true`
- [ ] Set appropriate `RATE_LIMIT` (e.g., `100/minute`)
- [ ] Configure `LOG_LEVEL=WARNING` or `ERROR`
- [ ] Set up monitoring/alerting on `/health` and `/metrics`
- [ ] Review security settings in `app/security.py`

---

## 🔒 Security

### **Input Security**
```python
# Automatic prompt injection detection
"Ignore previous instructions" → BLOCKED

# PII masking
"My email is john@example.com" → "My email is [EMAIL REDACTED]"
```

### **Output Security**
```python
# Prevents leaking PII in responses
"Contact us at support@company.com" → "Contact us at [EMAIL REDACTED]"

# Blocks harmful content
"Here's how to hack..." → [Response blocked: potentially harmful content]
```

### **Tested Attack Vectors**
- ✅ Prompt injection attempts
- ✅ System prompt extraction
- ✅ PII leakage (emails, phones, SSNs, credit cards)
- ✅ SQL injection patterns
- ✅ XSS attempts
- ✅ Harmful content generation

### **Security Configuration**
Edit `app/security.py` to customize:
- Injection patterns
- PII regex patterns
- Harmful content keywords
- Output validation rules

---

## 📊 Monitoring

### **Structured Logging**
All logs are JSON-formatted for easy parsing:
```json
{
  "timestamp": "2026-04-04T23:00:00Z",
  "level": "INFO",
  "message": "Request blocked by security",
  "module": "main",
  "function": "chat",
  "reason": ["Blocked: potential prompt injection detected"],
  "thread_id": "user-123"
}
```

### **LangSmith Tracing**
Enable tracing to see:
- Full LLM call traces
- Token usage
- Latency breakdown
- Error tracking

```bash
export LANGCHAIN_TRACING_V2=true
export LANGSMITH_API_KEY=lsv2_pt_...
```

View traces at: https://smith.langchain.com

### **Metrics Dashboard**
Monitor via `/metrics` endpoint:
- Total requests
- Error rate
- Cache hit rate
- Average latency

Integrate with:
- Prometheus
- Grafana
- Datadog
- New Relic

---

## 💻 Development

### **Project Structure**
```
75-langchain-production-API/
├── app/
│   ├── main.py              # FastAPI app + endpoints
│   ├── config.py            # Settings (Pydantic)
│   ├── models.py            # Request/response models
│   ├── security.py          # Security pipeline
│   ├── cache.py             # Response caching
│   ├── monitoring.py        # Logging + metrics
│   └── agent.py             # LangGraph agent
├── tests/
│   ├── pytest.ini           # Pytest config
│   ├── test_api.py          # API tests (27 tests)
│   ├── test_security.py     # Security tests
│   └── test_cache.py        # Cache tests
├── docker-compose.yml       # Docker Compose config
├── Dockerfile               # Docker image
├── render.yaml              # Render.com config
├── pyproject.toml           # Python dependencies (uv)
├── .env.example             # Environment template
└── README.md                # This file
```

### **Code Style**
- **Formatter**: Black (line length 88)
- **Linter**: Ruff
- **Type Hints**: Enforced with Pydantic
- **Docstrings**: Google style

### **Adding New Features**
1. Create feature branch
2. Implement with dependency injection pattern
3. Add tests (aim for 90%+ coverage)
4. Update documentation
5. Run tests: `uv run pytest tests/ -v`
6. Submit PR

### **Debugging**
```bash
# Run with debug logging
export LOG_LEVEL=DEBUG
uv run uvicorn app.main:app --reload

# Interactive debugging
uv run python -m pdb app/main.py

# Test specific endpoint
uv run pytest tests/test_api.py::TestChatEndpoint::test_chat_success_with_valid_message -v -s
```

### **Manual Testing Script**
```bash
# Run comprehensive manual tests
chmod +x Production-test-commands.sh
./Production-test-commands.sh
```

Tests include:
- Configuration loading
- Security pipeline (injection detection, PII masking)
- Output validation
- Cache functionality
- Logging
- Metrics collection
- API endpoints (health, chat, caching, rate limiting)

---

## 📚 Additional Resources

### **Documentation**
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [LangChain Docs](https://python.langchain.com)
- [LangGraph Docs](https://langchain-ai.github.io/langgraph/)
- [LangSmith Docs](https://docs.smith.langchain.com)
- [Pydantic Docs](https://docs.pydantic.dev)

### **Related Projects**
- [LangChain Templates](https://github.com/langchain-ai/langchain/tree/master/templates)
- [FastAPI Best Practices](https://github.com/zhanymkanov/fastapi-best-practices)

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

---

## 📄 License

MIT License - feel free to use this project as a template for your own production APIs.

---

## 🎯 Key Takeaways

This project demonstrates:
- ✅ **Production-ready FastAPI** with modern Python patterns
- ✅ **Dependency Injection** for clean, testable code
- ✅ **Comprehensive security** (input sanitization, PII masking, output validation)
- ✅ **Performance optimization** (caching, rate limiting)
- ✅ **Full observability** (logging, metrics, tracing)
- ✅ **Extensive testing** (27 tests, 90%+ coverage)
- ✅ **Easy deployment** (Docker, Render.com)
- ✅ **Enterprise patterns** ready for scale

Perfect for learning or as a foundation for your own LLM-powered APIs! 🚀

---

**Built with ❤️ using FastAPI, LangChain, and LangGraph**
