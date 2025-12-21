# 🚀 Daniel's Python Portfolio | Full-Stack Developer & AI Engineer

> **Building intelligent solutions with Python, Django, React, and cutting-edge AI technologies**

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-4.2-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![AI/ML](https://img.shields.io/badge/AI/ML-Llama%203-orange.svg)](https://ai.meta.com/llama/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Ready-blue.svg)](https://www.postgresql.org/)

Welcome to my comprehensive Python portfolio showcasing progressive mastery from fundamental programming concepts to production-ready full-stack applications and AI-powered enterprise solutions.

---

## 📊 Portfolio Overview

This repository demonstrates my journey through **14 structured learning modules** and **4 production-scale projects**, encompassing:

- **🎯 50+ Python programs** ranging from basic algorithms to complex systems
- **🤖 AI-Powered HR Management System** with Llama 3 integration
- **⚡ Full-Stack Django-React Application** with JWT authentication
- **🤖 AI-Powered Meeting System** with real-time transcription and analysis
- **🌤️ MCP Weather Servers** in TypeScript and Python with Claude Desktop integration
- **🔧 Enterprise-grade architecture** and best practices
- **🧪 Comprehensive testing** with pytest and modern testing frameworks

---

## 🏗️ Flagship Projects

### 1. 🤖 AI-Powered HR Management System

A cutting-edge HR platform leveraging Meta's Llama 3 70B for intelligent candidate screening

#### 🎯 Key Features

- **AI Integration**: Real-time candidate shortlisting using Groq API + Llama 3 70B
- **Job Management**: Complete CRUD operations for HR personnel
- **Application Tracking**: Comprehensive applicant workflow system
- **File Management**: Secure CV upload and processing with PDF validation
- **Responsive Design**: Mobile-optimized Bootstrap 5 interface
- **Score-based Screening**: AI-powered candidate scoring (0-100 scale)
- **JSON Response Parsing**: Structured AI responses with validation

#### 🛠️ Technical Implementation

```python
# AI-powered candidate evaluation using Llama 3
def consult_ai(job, cv_path):
    data = get_data(job=job, cv_path=cv_path)
    client = Groq(api_key=os.environ.get('GROQ_API_KEY'))
    completion = client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[{
            "role": "user",
            "content": f"""You are an experienced HR assistant. 
            Given a resume, job responsibilities and required qualifications 
            you are supposed to rate that resume in a scale of 0 to 100 percent
            return your response in a python dictionary format with score and summary as keys"""
        }]
    )
    return parse_ai_response(response)
```

#### 📋 Tech Stack

- **Backend**: Django 4.2, Django ORM
- **AI/ML**: Groq API, Meta Llama 3 70B, pypdf for CV processing
- **Frontend**: Bootstrap 5, Purple Admin Template
- **Database**: SQLite (dev), PostgreSQL ready (prod)
- **Testing**: pytest, pytest-django

#### 🚀 Production Features

- Environment-based configuration with .env support
- Secure file upload handling with PDF validation
- Database migrations and model relationships
- Admin interface for HR operations
- RESTful API design patterns
- Score-based candidate shortlisting (≥80 threshold)
- JSON response validation and error handling

---

### 2. ⚡ Django-React Full-Stack Application

Modern SPA with secure JWT authentication and scalable architecture

#### 🔐 Security & Authentication

- **JWT Token System**: Access/refresh token rotation
- **Password Security**: Django's built-in hashing
- **CORS Configuration**: Secure cross-origin requests
- **Input Validation**: Comprehensive data sanitization

#### 🏛️ Architecture Highlights

```javascript
// React frontend with secure API integration
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Authorization': `Bearer ${getAccessToken()}`
  }
});

// Automatic token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await refreshAccessToken();
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

#### 🛠️ Tech Stack

- **Backend**: Django REST Framework, Simple JWT
- **Frontend**: React 18, Vite, React Router
- **UI**: Tailwind CSS, Shadcn/ui, Lucide icons
- **Testing**: Vitest, React Testing Library
- **Database**: PostgreSQL production-ready

#### 📊 API Endpoints

- `/api/user/register/` - Secure user registration
- `/api/token/` - JWT token authentication
- `/api/token/refresh/` - Token rotation system
- Protected routes with middleware authentication

---

### 3. 🤖 AI-Powered Meeting System

A comprehensive meeting automation platform with real-time transcription, AI analysis, and multi-platform integration

#### 🎯 Meeting System Key Features

- **Real-time Transcription**: OpenAI Whisper integration for live meeting transcription
- **AI-Powered Analysis**: GPT-4 for meeting summaries, action items, and sentiment analysis
- **Multi-Platform Support**: Zoom, Google Meet, and Teams integration via Playwright automation
- **Bot Recorder**: Automated meeting recording without requiring platform SDKs
- **WebSockets**: Live transcription streaming to connected clients
- **OAuth Integration**: Secure authentication with meeting platforms
- **100% Python**: No Node.js or platform SDKs required

#### 🛠️ Meeting System Technical Implementation

```python
# AI-powered meeting processing with MCP
def transcribe_audio_tool(video_url: str) -> str:
    """Transcribe meeting audio using OpenAI Whisper"""
    audio_path = download_video(video_url)
    transcript = transcribe_audio(audio_path)  # OpenAI Whisper
    return transcript

def summarize_meeting_tool(transcript: str) -> str:
    """Generate meeting summary using GPT-4"""
    summary = summarize_meeting(transcript)  # GPT-4 analysis
    actions = extract_action_items(transcript)
    return {
        "transcript": transcript,
        "summary": summary,
        "actions": actions
    }

# Bot Recorder with Playwright
async def _join_with_playwright(self):
    from playwright.async_api import async_playwright
    playwright = await async_playwright().start()
    browser = await playwright.chromium.launch()
    # Automatically joins meeting without SDK
```

#### 📋 Meeting System Tech Stack

- **Backend**: FastAPI, WebSockets, Playwright
- **AI/ML**: OpenAI Whisper, GPT-4, FastMCP
- **Automation**: Playwright browser automation (100% Python)
- **Real-time**: WebSockets for live transcription (`/ws/transcript/{meeting_id}`)
- **Authentication**: OAuth 2.0 for meeting platforms
- **Architecture**: 2-file system (MCP_SERVER.py + MEETING_API.py)

#### 🚀 Meeting System Production Features

- Multi-threaded processing for concurrent meetings
- Secure file upload and processing
- Real-time WebSocket communication
- Comprehensive error handling and logging
- Production-ready deployment configuration
- No platform SDKs required (Playwright-based approach)
- OAuth integration with Zoom, Google Meet, Teams

---

### 4. 🌤️ MCP Weather Servers & AI Integration

Model Context Protocol (MCP) servers providing seamless integration with AI assistants like Claude Desktop, featuring advanced authentication and real-time data processing

#### 🎯 MCP Servers Key Features

- **Dual Implementation**: TypeScript and Python versions for different ecosystems
- **MCP Protocol**: JSON-RPC 2.0 communication via stdio
- **Weather Data**: Integration with National Weather Service API
- **AI Assistant Integration**: Works with Claude Desktop and Windsurf
- **Real-time Data**: Weather alerts and forecasts for any US location
- **Cross-platform**: Compatible with Windows, macOS, and Linux
- **Advanced Authentication**: OAuth 2.0 with Auth0 integration
- **Cloudflare Workers**: Production-ready deployment on serverless platform
- **Remote MCP**: Secure remote server connections with token management
- **Context Engineering**: Optimized token usage and context management
- **Agent Skills**: Multi-agent systems with specialized capabilities

#### 🛠️ MCP Servers Technical Implementation

```python
# Python MCP Server with FastMCP
@mcp.tool(name="get-forecast")
async def get_forecast(latitude: float, longitude: float) -> str:
    """Get weather forecast for coordinates."""
    url = f"{NWS_API_BASE}/points/{latitude},{longitude}"
    data = await make_nws_request(url)
    return format_forecast(data)

@mcp.tool(name="get-alerts") 
async def get_alerts(state: str) -> str:
    """Get weather alerts for a US state."""
    url = f"{NWS_API_BASE}/alerts/active/area/{state}"
    data = await make_nws_request(url)
    return format_alerts(data)
```

#### 📋 MCP Servers Tech Stack

- **Python Version**: FastMCP, httpx, uv package management
- **TypeScript Version**: Node.js, npm, TypeScript compilation
- **Protocol**: JSON-RPC 2.0 over stdio
- **API Integration**: National Weather Service REST API
- **Authentication**: OAuth 2.0, Auth0, JWT token management
- **Deployment**: Cloudflare Workers, serverless architecture
- **Remote Access**: mcp-remote CLI tool for secure connections
- **Context Optimization**: FastMCP 2.12.4+ with advanced features
- **Multi-Agent**: LangChain integration with agent orchestration

#### 🚀 Advanced Features

- **Auth0 Integration**: Complete OAuth 2.0 flow with PKCE
- **Cloudflare Deployment**: Serverless MCP servers with global distribution
- **Remote Authentication**: Secure token-based remote MCP connections
- **Context Engineering**: Optimized token usage for AI assistants
- **Multi-Agent Systems**: Specialized agents for different tasks
- **Real-time Processing**: WebSocket connections for live data
- **Production Monitoring**: Comprehensive logging and error handling
- **Enterprise Security**: Role-based access control and audit logging

---

## 🎓 Learning Progression & Technical Skills

### 📚 Foundations (Days 1-6)

#### Core Python Programming & Algorithmic Thinking

| Project | Skills Demonstrated | Complexity |
|---------|-------------------|------------|
| **Printing & Variables** | String formatting, type conversion, f-strings | ⭐ |
| **Data Types & Type System** | Primitive types, operators, type casting | ⭐⭐ |
| **Tip Calculator** | Mathematical operations, user input, business logic | ⭐⭐ |
| **Treasure Island Game** | Conditional logic, control flow, game development | ⭐⭐⭐ |
| **Rock-Paper-Scissors** | Randomization, arrays, game logic, ASCII art | ⭐⭐⭐ |
| **Password Generator** | Loops, string manipulation, security concepts | ⭐⭐⭐ |

### 🔧 Intermediate Concepts (Days 7-12)

#### Advanced Programming Patterns & Problem Solving

| Project | Technical Skills | Applications |
|---------|------------------|-------------|
| **Hangman Game** | ASCII art, word lists, game state management | Game Development |
| **Caesar Cipher** | Encryption/decryption, modular arithmetic, text processing | Cryptography |
| **Dictionary Mastery** | Data structures, JSON-like operations, complex data handling | Data Management |
| **Function Design** | Return values, scope management, modular programming | Software Architecture |
| **Testing & Debugging** | pytest, error handling, code validation | Quality Assurance |
| **Scope Management** | Local/global variables, memory management, best practices | System Design |

---

## 💼 Enterprise-Ready Skills Demonstrated

### 🎯 Software Engineering Excellence

- **Clean Code Principles**: PEP 8 compliance, descriptive naming, modular design
- **Testing Methodology**: Unit tests, integration tests, TDD concepts
- **Version Control**: Git workflow, branching strategies, collaborative development
- **Documentation**: Comprehensive READMEs, code comments, API documentation

### 🏗️ System Architecture

- **MVC/MVT Patterns**: Django's Model-View-Template architecture
- **RESTful Design**: Proper HTTP methods, status codes, resource modeling
- **Database Design**: Relational modeling, migrations, ORM optimization
- **Security Implementation**: Authentication, authorization, data validation

### 🚀 Modern Development Practices

- **Environment Management**: Virtual environments, dependency isolation
- **Configuration Management**: Environment variables, settings separation
- **API Development**: REST standards, serialization, error handling
- **Frontend Integration**: CORS, JWT, modern JavaScript/React patterns

### 🤖 AI/ML Integration

- **LLM Integration**: Groq API, prompt engineering, response parsing
- **Real-time Processing**: Asynchronous operations, error handling
- **Data Processing**: File handling, PDF processing, text analysis
- **Scalable AI Architecture**: Modular design for AI features

---

## 🛠️ Technical Stack Summary

### Backend Technologies

```yaml
Python: 3.8+
Django: 4.2
Django REST Framework: Latest
PostgreSQL: Production Ready
SQLite: Development
JWT: Simple JWT
Testing: pytest, pytest-django
```

### Frontend Technologies

```yaml
React: 18.2
Vite: Latest
Tailwind CSS: 3.4+
Shadcn/ui: Modern component library
Axios: HTTP client
React Router: Client-side routing
Testing: Vitest, React Testing Library
```

### AI & Machine Learning

```yaml
LLM: Meta Llama 3 70B
API: Groq Cloud Platform
Prompt Engineering: Custom implementations
Text Processing: NLP fundamentals
```

### Development Tools

```yaml
Version Control: Git
Environment: Python venv
Package Management: pip, npm
Code Quality: ESLint, PEP 8
Debugging: Django Debug Toolbar
```

---

## 📈 Project Metrics & Impact

### Code Quality Metrics

- **50+ Python programs** with increasing complexity
- **4 production-ready applications** with enterprise features
- **Comprehensive test coverage** across all major projects
- **Documentation-first approach** with detailed READMEs
- **Multi-language implementations** (Python, TypeScript, JavaScript)

### Technical Complexity

- **Multi-tier architecture** (Frontend, Backend, AI services)
- **Real-time AI integration** with production APIs
- **Security-first implementation** with JWT and data validation
- **Scalable design patterns** for enterprise applications
- **MCP Protocol implementation** for AI assistant integration
- **OAuth 2.0 authentication** with Auth0 and enterprise security
- **Cloudflare Workers deployment** for global serverless architecture
- **Remote MCP connections** with secure token management
- **Context engineering optimization** for AI efficiency
- **Multi-agent systems** with specialized task capabilities
- **Real-time communication** with WebSockets and stdio protocols
- **Cross-platform automation** with Playwright browser control
- **Multi-language development** (Python, TypeScript, JavaScript)
- **Enterprise-grade monitoring** and logging systems

### Learning Progression

- **Systematic skill building** from basics to advanced concepts
- **Project-based learning** with real-world applications
- **Modern tech stack** aligned with industry standards
- **Continuous improvement** with refactoring and optimization

---

## 🚀 Getting Started

### Prerequisites

```bash
# Python Environment
Python 3.8+
pip (latest)
virtualenv

# Node.js Environment (for React projects)
Node.js 16+
npm or yarn
```

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/DanielGeek/python_projects.git
cd python_projects

# Explore daily exercises
ls 0*-day-*/

# Run flagship projects
cd 13-AIHR  # AI-Powered HR System
# or
cd 14-Django-React-Full-Stack-App  # Full-Stack App
# or
cd 16-MCP-meetings  # AI-Powered Meeting System
# or
cd 17-mcp-servers  # MCP Weather Servers
```

### Installation Examples

#### AI-Powered HR System

```bash
cd 13-AIHR
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

#### Django-React Full-Stack App

```bash
# Backend
cd 14-Django-React-Full-Stack-App/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend (new terminal)
cd ../frontend
npm install
npm run dev
```

#### AI-Powered Meeting System

```bash
cd 16-MCP-meetings
uv sync
source .venv/bin/activate

# Terminal 1: MCP Server (AI processing)
uv run MCP_SERVER.py

# Terminal 2: Meeting API (orchestrator)
uv run MEETING_API.py
```

#### MCP Weather Servers & AI Integration

```bash
# Python Weather Server
cd 17-mcp-servers/02-weather-server-python
uv sync
uv run python test_weather.py  # Test locally
# Configure with Claude Desktop or Windsurf using README instructions

# TypeScript Weather Server
cd 17-mcp-servers/01-weather-server-typescript
npm install
npm run build
npm run test  # Test locally
# Configure with Claude Desktop or Windsurf using README instructions

# Auth0 MCP Server (Production)
cd 17-mcp-servers/09-remote-mcp-auth0/mcp-auth0-oidc
npm run build
npm run deploy  # Deploy to Cloudflare Workers
# Configure Claude Desktop with OAuth authentication

# Context Engineering
cd 17-mcp-servers/10-context-engineering-mcp
uv sync
fastmcp dev verbose_mcp_server.py  # Development with MCP Inspector

# Agent Skills
cd 17-mcp-servers/11-agent-skills
npm install
npm run dev  # Next.js development server
```

---

## 🧪 Testing & Quality Assurance

### Running Tests

```bash
# Django Projects
pytest  # AIHR Project
python manage.py test  # Django-React Backend

# React Frontend
npm test  # Frontend unit tests
npm run test:coverage  # Coverage reports

# AI-Powered Meeting System
uv run python test_mcp_client.py  # Test MCP server integration
curl http://localhost:8001/docs  # API documentation testing

# MCP Weather Servers
cd 17-mcp-servers/02-weather-server-python
uv run python test_weather.py  # Test Python MCP server

cd ../01-weather-server-typescript
npm run test  # Test TypeScript MCP server
mcp-inspector node build/index.js  # Interactive testing
```

### Code Quality Standards

- **PEP 8 Compliance**: All Python code follows style guidelines
- **ESLint Configuration**: JavaScript/React code quality
- **Type Safety**: PropTypes and TypeScript considerations
- **Documentation**: Comprehensive inline and external documentation

---

## 🎯 Why This Portfolio Matters for Big Tech

### 🔧 Technical Excellence

- **Full-Stack Proficiency**: End-to-end application development
- **Modern Architecture**: Microservices, REST APIs, SPAs
- **AI Integration**: Practical LLM implementation in production
- **Security-First**: Authentication, authorization, data protection

### 🚀 Innovation & Problem-Solving

- **AI-Powered Solutions**: Real-world AI integration beyond demos
- **Scalable Design**: Enterprise-ready architecture patterns
- **User-Centric Approach**: Responsive design, UX considerations
- **Performance Optimization**: Efficient database queries, frontend optimization

### 📈 Growth Potential

- **Continuous Learning**: Progressive skill development
- **Adaptability**: Multiple tech stacks and paradigms
- **Best Practices**: Industry-standard development workflows
- **Collaboration Ready**: Clean code, documentation, version control

---

## 📞 Connect & Explore

**🔗 Live Demonstrations Available Upon Request**

**📧 Contact for recruitment opportunities and technical discussions**

**🌟 Open to challenging roles in Full-Stack Development, AI Engineering, and Backend Systems**

---

## 📄 License

All projects are open source and available under the MIT License - see individual project licenses for details.

---

> **💡 Note**: This portfolio represents a journey of continuous learning and technical growth. Each project builds upon previous knowledge, demonstrating the ability to master new technologies and apply them to solve real-world problems.

**🚀 Ready to bring this expertise to your team!**
