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

This repository demonstrates my journey through **14 structured learning modules** and **8 production-scale projects**, encompassing:

- **🎯 50+ Python programs** ranging from basic algorithms to complex systems
- **🤖 AI-Powered HR Management System** with Llama 3 integration
- **⚡ Full-Stack Django-React Application** with JWT authentication
- **🤖 AI-Powered Meeting System** with real-time transcription and analysis
- **🌤️ MCP Weather Servers** in TypeScript and Python with Claude Desktop integration
- **🤖 AI Data Generator Agent** with LangChain and Google Gemini for sample data generation
- **🧠 21-RAG-AI Advanced RAG System** with Google Gemini, Inngest, and Streamlit
- **🔍 22-AI-Search-Agent Multi-Source Research Agent** with Bright Data, Google Gemini, and Reddit integration
- **🔧 23-AI-Agent Multi-LLM Evaluation System** with OpenAI, Google Gemini, Ollama, and real-time evaluation
- **🤝 24-AI-Career-Assistant Professional AI Assistant** with tool use, Pushover notifications, and contextual responses
- **🎭 27-CrewAI-Debate Multi-Agent Debate System** with CrewAI, structured argumentation, and real-time debate orchestration
- **💰 28-CrewAI-Financial-Researcher Real-Time Financial Analysis System** with CrewAI, SerperDevTool, and live market data integration
- **📈 29-CrewAI-Stock-Picker Intelligent Investment Analysis System** with CrewAI, hierarchical management, persistent memory, and real-time notifications
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

### 5. 🤖 AI Data Generator Agent

An intelligent AI agent built with LangChain that generates realistic sample user data for applications and testing purposes, featuring natural language processing and structured JSON output generation.

#### 🎯 AI Data Generator Key Features

- **Natural Language Interface**: Conversational commands for data generation using Google Gemini 2.5 Flash
- **Structured JSON Output**: Complete user profiles with ID, names, email, username, age, registration dates
- **Smart Parameter Inference**: Automatically fills in names, domains, and age ranges based on context
- **File Operations**: Read/write JSON files with proper formatting and validation
- **Customizable Data**: Control age ranges, email domains, specific names, and more
- **Real-time Processing**: Instant data generation with AI-powered understanding
- **Production Ready**: Error handling, logging, and comprehensive documentation

#### 🛠️ AI Data Generator Technical Implementation

```python
# AI-powered data generation with LangChain
@tool
def generate_sample_users(
    first_names: List[str],
    last_names: List[str],
    domains: List[str],
    min_age: int,
    max_age: int
) -> dict:
    """Generate sample user data with complete profiles"""
    users = []
    for i in range(len(first_names)):
        user = {
            "id": i + 1,
            "firstName": first_names[i],
            "lastName": last_names[i % len(last_names)],
            "email": f"{first_names[i].lower()}.{last_names[i % len(last_names)].lower()}@{domains[i % len(domains)]}",
            "username": f"{first_names[i].lower()}{random.randint(100, 999)}",
            "age": random.randint(min_age, max_age),
            "registeredAt": (datetime.now() - timedelta(days=random.randint(1, 365))).isoformat()
        }
        users.append(user)
    return {"users": users, "count": len(users)}

# Natural language processing with Google Gemini
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")
agent = create_agent(llm, TOOLS, system_prompt=SYSTEM_MESSAGE)
```

#### 📋 AI Data Generator Tech Stack

- **AI Framework**: LangChain with Google Gemini 2.5 Flash integration
- **Data Processing**: Pydantic for validation, JSON for structured output
- **Package Management**: UV for modern Python dependency management
- **Natural Language**: Advanced prompt engineering for context understanding
- **File Operations**: JSON read/write with error handling and validation
- **Architecture**: Tool-based design with extensible function system

#### 🚀 AI Data Generator Production Features

- Conversational interface for non-technical users
- Automatic parameter inference from natural language
- Comprehensive error handling and user feedback
- Extensible tool system for additional data types
- Production-ready logging and monitoring
- Complete documentation and examples
- Cross-platform compatibility (Windows, macOS, Linux)

#### 💡 CLI Agent Example Usage

```bash
# Start the agent
uv run main.py

# Natural language commands
You: generate 5 random users
You: make users aged 25-35 with company.com emails and save 3 of them to users.json
You: what is the oldest user in users.json?
```

---

### 6. 🧠 21-RAG-AI: Advanced Retrieval-Augmented Generation System

A sophisticated event-driven RAG application demonstrating modern AI integration patterns with Google Gemini, Inngest, Qdrant, and Streamlit for intelligent document processing and querying.

#### 🎯 RAG System Key Features

- **Google Gemini 2.5 Flash Integration**: Advanced LLM for intelligent responses with text-embedding-004
- **Event-Driven Architecture**: Scalable processing with Inngest for async workflows
- **Vector Database**: Qdrant for high-performance similarity search and storage
- **Real-time Processing**: Live PDF ingestion, chunking, and embedding generation
- **Beautiful UI**: Streamlit frontend for document upload and intelligent querying
- **Semantic Search**: Advanced embedding-based retrieval with source attribution
- **Production Ready**: Type safety, error handling, and comprehensive logging

#### 🛠️ RAG System Technical Implementation

```python
# Event-driven PDF ingestion with Inngest
@inngest_client.create_function(
    fn_id="RAG: Ingest PDF",
    trigger=inngest.TriggerEvent(event="rag/ingest_pdf"),
)
async def rag_ingest_pdf(ctx: inngest.Context):
    # Load and chunk PDF
    chunks_and_src = await ctx.step.run("load-and-chunk", lambda: _load(ctx))
    # Generate embeddings and store in Qdrant
    ingested = await ctx.step.run("embed-and-upsert", lambda: _upsert(chunks_and_src))
    return ingested.model_dump()

# Intelligent querying with context
@inngest_client.create_function(
    fn_id="RAG: Query PDF", 
    trigger=inngest.TriggerEvent(event="rag/query_pdf_ai"),
)
async def rag_query_pdf_ai(ctx: inngest.Context):
    # Embed question and search vectors
    found = await ctx.step.run("embed-and-search", lambda: _search(question, top_k))
    # Generate contextual response with Gemini
    answer = await ctx.step.run("llm-answer", lambda: _generate_answer(user_content))
    return {"answer": answer, "sources": found.sources}
```

#### 📋 RAG System Tech Stack

- **AI/ML**: Google Gemini 2.5 Flash, text-embedding-004 (768 dimensions)
- **Backend**: FastAPI with async/await, Inngest for event-driven processing
- **Vector DB**: Qdrant for similarity search and vector storage
- **Frontend**: Streamlit for beautiful, responsive web interface
- **Package Management**: UV for modern Python dependency management
- **Architecture**: Event-driven microservices with type safety

#### 🚀 RAG System Production Features

- Multi-terminal architecture (FastAPI + Inngest + Qdrant + Streamlit)
- Real-time PDF processing with automatic chunking and embedding
- Semantic search with configurable retrieval parameters
- Comprehensive error handling and status monitoring
- Type-safe implementation with Pydantic models
- Hot reloading for fast development cycles
- Docker-ready deployment configuration

#### 💡 Vector Database Example Usage

```bash
# Terminal 1: Start Qdrant vector database
docker run -d --name qdrant-rag -p 6333:6333 qdrant/qdrant:latest

# Terminal 2: Start FastAPI backend with Inngest
uv run uvicorn main:app --reload

# Terminal 3: Start Inngest dev server
npx inngest-cli@latest dev -u http://127.0.0.1:8000/api/inngest

# Terminal 4: Start Streamlit frontend
uv run streamlit run streamlit_app.py

# Use the web interface at http://localhost:8501
# Upload PDFs and ask intelligent questions about your documents
```

---

### 7. 🔍 22-AI-Search-Agent: Multi-Source Research Agent

An intelligent multi-source research agent that leverages multiple search engines and social media platforms to provide comprehensive, well-analyzed answers to user queries.

#### 🎯 AI Search Agent Key Features

- **Multi-Source Intelligence**: Google, Bing, and Reddit search with unified analysis
- **Bright Data Integration**: Professional-grade web scraping with SERP and Reddit APIs
- **LangGraph Workflow**: Complex multi-step research orchestration with state management
- **Google Gemini AI**: Advanced reasoning and synthesis from multiple data sources
- **Structured Data Processing**: Pydantic models for type-safe data handling
- **Real-time Progress Tracking**: Asynchronous snapshot polling and download management
- **Comprehensive Analysis**: Individual source analysis with final intelligent synthesis

#### 🛠️ AI Search Agent Technical Implementation

```python
# Multi-source search orchestration with LangGraph
def search_google(state: State):
    query = state.get("user_question", "")
    google_results = serp_search(query, engine="google")
    return {"google_results": google_results}

def search_bing(state: State):
    query = state.get("user_question", "")
    bing_results = serp_search(query, engine="bing")
    return {"bing_results": bing_results}

def search_reddit(state: State):
    query = state.get("user_question", "")
    reddit_results = reddit_search_api(query)
    return {"reddit_results": reddit_results}

# AI-powered URL selection and content extraction
def analyze_reddit_urls(state: State):
    reddit_results = state.get("reddit_results", "")
    messages = get_reddit_url_analysis_messages(reddit_results)
    structured_llm = llm.with_structured_output(RedditURLAnalysis)
    analysis = structured_llm.invoke(messages)
    return {"selected_reddit_urls": analysis.selected_urls}
```

#### 📋 AI Search Agent Tech Stack

- **AI Framework**: LangChain with Google Gemini 2.5 Flash integration
- **Workflow Orchestration**: LangGraph for complex multi-step processes
- **Web Scraping**: Bright Data SERP API and Reddit Datasets API
- **Data Processing**: Pydantic models, structured outputs, JSON handling
- **Package Management**: UV for modern Python dependency management
- **Architecture**: State-based workflow with parallel processing

#### 🚀 AI Search Agent Production Features

- Parallel multi-source data collection for faster results
- Configurable retry logic and timeout handling for API reliability
- Intelligent URL selection using structured LLM outputs
- Comprehensive error handling with graceful degradation
- Real-time progress tracking and user feedback
- Type-safe implementation with full Pydantic validation
- Extensible architecture for additional search sources

#### 💡 Multi-Source Example Usage

```bash
# Setup and run the multi-source research agent
cd 22-AI-Search-Agent
uv sync
cp .env.example .env
# Edit .env with Bright Data and Google API keys
uv run main.py

# Example research queries
Ask me anything: invest in NVIDIA
Ask me anything: best programming languages for AI development
Ask me anything: climate change impact on technology
```

### 8. 🤖 24-AI-Career-Assistant: Advanced Multi-Model AI Career Assistant

A sophisticated AI career assistant powered by Google Gemini models with advanced multi-model rotation, session tracking, and comprehensive API management system.

#### 🎯 Key Features

- **Multi-Model AI Chat**: Intelligent conversation using Google's free Gemini models
- **4-Model Rotation System**: Automatic switching between gemini-2.5-flash, gemini-2.0-flash, gemini-2.5-flash-lite, and gemini-2.0-flash-lite
- **Smart Rate Limiting**: Exponential backoff with automatic retry logic (1min → 30min)
- **Session Tracking**: UUID-based session tracking for user interaction analytics
- **Real-time Notifications**: Pushover integration with complete API usage statistics
- **Career Showcase**: Displays Daniel's 12+ years of software development expertise
- **Smart Tool Integration**: Automatic detection of unknown questions, contact requests, and job offers

#### 🛠️ Technical Implementation

```python
# Advanced API Management with Multi-Model Rotation
class APIKeyModelManager:
    def __init__(self):
        self.keys = self._load_api_keys()
        self.models = FREE_MODELS  # 4 Gemini models
        self.usage_per_combination = {}  # Track per (key, model) usage
        
    def increment_usage(self):
        """Increment usage for current key and model combination"""
        combo = (self.current_key_index, self.current_model_index)
        if combo not in self.usage_per_combination:
            self.usage_per_combination[combo] = 0
        self.usage_per_combination[combo] += 1
        
    def get_usage_stats(self):
        """Display real-time usage statistics per model+key combination"""
        # Shows per-model usage with proper reset on model switch
        return comprehensive_usage_display

# Session-aware tool calling with tracking
def handle_tool_call(self, tool_calls):
    results = []
    for tool_call in tool_calls:
        tool_name = tool_call.function.name
        arguments = json.loads(tool_call.function.arguments)
        # Add session_id to all tool calls for tracking
        arguments['session_id'] = self.session_id
        tool = globals().get(tool_name)
        result = tool(**arguments) if tool else {}
        results.append({
            "role": "tool",
            "content": json.dumps(result),
            "tool_call_id": tool_call.id
        })
    return results
```

#### 🔧 Advanced Features

**Multi-Model Rotation Logic:**

- **gemini-2.5-flash**: Best quality, hybrid reasoning, 1M context
- **gemini-2.0-flash**: Multimodal, agent-ready, 1M context  
- **gemini-2.5-flash-lite**: Cost-effective, high throughput
- **gemini-2.0-flash-lite**: Fastest, most economical

**Session Management:**

```python
# UUID-based session tracking
self.session_id = str(uuid.uuid4())

# Enhanced push notifications with session context
def push(text, session_id=None, user_context=None):
    full_message = text + "\n\n" + "="*40
    full_message += f"\n📍 Session ID: {session_id[:8]}..."
    full_message += f"\n• Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    full_message += f"\n\n🔑 Gemini API Usage:\n{api_manager.get_usage_stats()}"
```

**Intelligent Tool Detection:**

- `record_unknown_question`: Captures questions outside Daniel's expertise
- `record_user_details`: Handles contact information and networking requests  
- `record_job_offer`: Processes job opportunities with compensation details

#### 📊 Real-time Usage Monitoring

```text
🤖 Current Model: gemini-2.5-flash
🔑 Current Key: 3

Key 1: 20/20 used ⚠️ (1/4 models exhausted) (resets in 23h 59m)
Key 2: 15/20 used ✅
Key 3: 3/20 used ✅
Key 4: 0/20 used ✅
```

#### 🚀 Production Features

**API Management:**

- **Per-model usage tracking**: Independent counters for each model+key combination
- **Automatic rotation**: Seamless switching when quotas are exhausted
- **Backoff strategy**: Exponential backoff for rate limit handling
- **Error recovery**: Comprehensive error handling with automatic retry

**Professional Applications:**

- **Career Networking**: Automated response to professional inquiries
- **Job Opportunity Detection**: Immediate notification of relevant positions
- **Knowledge Gap Analysis**: Identify topics to expand expertise
- **Business Development**: Lead capture and qualification system

#### 💡 Career Assistant Example Usage

```bash
# Setup and run the advanced AI career assistant
cd 24-AI-Career-Assistant
uv sync
cp .env.example .env
# Edit .env with 4 Google Gemini API keys and Pushover credentials
uv run daniel-chatbot.py

# Available at http://127.0.0.1:7860 or https://[random-id].gradio.live

# Example interactions:
# "What experience do you have with AI and blockchain development?"
# "I'm recruiting for a senior Python position at JP Morgan"
# "Can you help me understand your consulting rates and availability?"
```

#### 🎯 Enterprise-Ready Capabilities

- **Multi-API Key Management**: Load balancing across 4 Gemini API keys
- **Session Analytics**: Complete interaction tracking with UUID-based sessions
- **Real-time Monitoring**: Live usage statistics and API quota management
- **Professional Branding**: Tailored for Daniel's 12+ years software development experience
- **Mobile Notifications**: Instant alerts with comprehensive usage analytics

---

### 9. 🤖 25-OpenAI-Agent: Multi-Model Automated SDR System

A sophisticated multi-model AI agent system leveraging OpenAI Agents SDK for automated sales development representative (SDR) workflows with intelligent model rotation and complete email automation pipeline.

#### 🎯 Key Features

- **Multi-Model AI Agents**: DeepSeek, Gemini, Llama3.3, and OpenAI models with intelligent fallback rotation
- **Automated Email Generation**: Three specialized email styles (professional, humorous, concise) with real-time generation
- **Smart Model Rotation**: 4-attempt fallback system (Primary → OpenAI → Other1 → Other2) with comprehensive error handling
- **Complete Email Workflow**: Generation → Selection → Subject Writing → HTML Conversion → Email Sending
- **Input Guardrails**: Advanced name detection and validation system for security compliance
- **Real-time Tracing**: Full OpenAI dashboard visibility for all model attempts and executions
- **Resend Integration**: Professional email delivery with HTML formatting and delivery confirmation
- **Enterprise Error Handling**: Graceful handling of API failures (402, 403, 429) with automatic retry logic

#### 🛠️ Technical Implementation

```python
# Multi-model rotation with real execution and tracing
async def _run_agent_with_rotation(tool_name: str, instructions: str, input_text: str, model_sequence: list) -> str:
    """Try each model in sequence until one succeeds. Each attempt appears in traces."""
    for i, (model, model_name) in enumerate(model_sequence):
        try:
            print(f"  🔄 [{tool_name}] Attempt {i+1}/4: Trying {model_name}...")
            agent = Agent(name=f"{model_name} Sales Agent", instructions=instructions, model=model)
            result = await Runner.run(agent, input_text)  # Real model execution
            print(f"  ✅ [{tool_name}] {model_name} succeeded!")
            return result.final_output
        except Exception as e:
            print(f"  ❌ [{tool_name}] {model_name} failed: {str(e)[:80]}")
            continue  # Rotate to next model

# Input guardrails for security
@input_guardrail
async def guardrail_against_name(ctx, agent, message):
    result = await Runner.run(guardrail_agent, message, context=ctx.context)
    is_name_in_message = result.final_output.is_name_in_message
    return GuardrailFunctionOutput(
        output_info={"found_name": result.final_output},
        tripwire_triggered=is_name_in_message
    )
```

#### 📋 Tech Stack

- **AI Framework**: OpenAI Agents SDK with multi-model support
- **Models**: DeepSeek, Gemini, Llama3.3, OpenAI gpt-4o-mini with rotation logic
- **Email Service**: Resend API with HTML formatting and delivery tracking
- **Security**: Input guardrails with name detection and validation
- **Monitoring**: Real-time tracing with OpenAI dashboard integration
- **Package Management**: UV for modern Python dependency management

#### 🚀 Advanced Features

**Model Rotation Strategy:**

```python
# Each tool attempts models in different orders for diversity
TOOL1: DeepSeek → OpenAI → Gemini → Llama3.3
TOOL2: Gemini → OpenAI → Llama3.3 → DeepSeek  
TOOL3: Llama3.3 → OpenAI → DeepSeek → Gemini
```

**Complete Workflow:**

1. **Input Validation**: Guardrail agent checks for personal information
2. **Email Generation**: 3 sales agents create different style drafts
3. **Model Rotation**: Each agent tries 4 models until success
4. **Selection**: Sales Manager selects best email draft
5. **Email Processing**: Subject writing + HTML conversion
6. **Delivery**: Email sent via Resend with confirmation

**Error Handling:**

- **402 Insufficient Balance**: Automatic rotation to next model
- **403 Access Denied**: Seamless transition to backup model
- **429 Rate Limit**: Intelligent retry with exponential backoff
- **Max Turns Exceeded**: Fallback to next Sales Manager model

#### 💡 Multi-Model SDR Example Usage

```bash
# Setup and run the multi-model automated SDR system
cd 25-openai-agent
uv sync
cp .env.example .env
# Edit .env with API keys (OpenAI, Google, DeepSeek, Groq, Resend)
uv run main.py

# Example output with model rotation:
🔄 [TOOL1] Starting multi-model rotation (DeepSeek -> OpenAI -> Gemini -> Llama3.3)
  🔄 [TOOL1] Attempt 1/4: Trying DeepSeek...
  ❌ [TOOL1] DeepSeek failed: Error code: 402 - Insufficient Balance
  🔄 [TOOL1] Attempt 2/4: Trying OpenAI...
  ✅ [TOOL1] OpenAI succeeded!

✅ [SALES_MGR] Handoff successful! Sales Manager → Email Manager
📧 [SALES_MGR] Email should have been processed and sent by Email Manager
```

#### 🎯 Enterprise-Ready Capabilities

- **Multi-API Management**: Load balancing across 4 different AI providers
- **Real-time Monitoring**: Complete visibility into model attempts and success rates
- **Security Compliance**: Input validation with guardrail protection
- **Production Logging**: Comprehensive error tracking and performance metrics
- **Email Automation**: Professional delivery with HTML formatting and tracking

---

### 7. 🎭 27-CrewAI-Debate: Multi-Agent Debate System

A sophisticated multi-agent debate system powered by CrewAI that simulates structured debates on complex topics with AI agents taking different positions and providing objective analysis.

#### 🎯 Key Features

- **Multi-Agent Architecture**: Three specialized AI agents (Pro-Regulation, Anti-Regulation, Moderator)
- **Structured Debate Flow**: Opening arguments → Context-aware rebuttals → Final analysis
- **Real-time Tracing**: Built-in execution tracing with CrewAI Cloud integration
- **Customizable Topics**: Easy to modify debate subjects and agent configurations
- **Context-Aware Responses**: Agents reference previous arguments in rebuttals
- **Objective Moderation**: Independent moderator evaluates both sides comprehensively

#### 🛠️ Technical Implementation

```python
# Crew orchestration with sequential process
crew = Crew(
    agents=[pro_agent, anti_agent, moderator],
    tasks=[pro_task, anti_task, pro_rebuttal, anti_rebuttal, moderator_task],
    process=Process.sequential,
    verbose=True
)

# Execute debate with real-time tracing
result = crew.kickoff()
```

#### 📋 Tech Stack

- **Framework**: CrewAI 1.8+ with multi-agent orchestration
- **AI/ML**: OpenAI GPT models (gpt-4o-mini, gpt-4, etc.)
- **Configuration**: YAML-based agent and task definitions
- **Tracing**: CrewAI Cloud integration for debugging and monitoring
- **Package Management**: UV with Python 3.12 compatibility

#### 🎭 Debate Structure

1. **Opening Arguments** (300-400 words each)
   - Pro-regulation advocate presents comprehensive case
   - Anti-regulation advocate presents counter-arguments

2. **Context-Aware Rebuttals** (200-300 words each)
   - Each agent addresses specific points from opposition
   - Builds upon previous arguments with evidence

3. **Final Analysis** (400-500 words)
   - Moderator evaluates both sides objectively
   - Identifies strongest arguments and logical fallacies
   - Provides balanced conclusion

#### 💡 Example Usage

```bash
# Setup CrewAI CLI with Python 3.12
uv tool install crewai --python 3.12

# Create and setup project
crewai create crew debate-ai
cd debate-ai
crewai install

# Configure environment
cp .env.example .env
# Edit .env with OPENAI_API_KEY

# Run structured debate
crewai run

# Enable tracing for debugging
crewai traces enable
```

#### 🎯 Advanced Capabilities

- **Extensible Architecture**: Add more agents and debate topics
- **Knowledge Integration**: Support for external knowledge bases
- **Real-time Monitoring**: Complete visibility into agent interactions
- **Custom LLM Support**: Compatible with OpenAI, Anthropic, Groq, and more
- **YAML Configuration**: Easy modification of agents and tasks without code changes

#### 📊 Example Output

The system generates comprehensive debate outputs:

- **Structured Arguments**: Evidence-based positions with clear reasoning
- **Intelligent Rebuttals**: Context-aware responses to opposition points
- **Objective Analysis**: Balanced evaluation with identification of logical fallacies
- **Trace Reports**: Detailed execution logs for debugging and improvement

---

### 8. 💰 28-CrewAI-Financial-Researcher: Real-Time Financial Analysis System

A sophisticated financial research and analysis system powered by CrewAI that provides up-to-date company analysis using real-time web searches and professional financial reporting.

#### 🎯 Key Features

- **Real-Time Data Integration**: Live stock prices, recent news, earnings reports, and market analysis via SerperDevTool
- **Multi-Agent Architecture**: Senior Financial Researcher (web search specialist) and Market Analyst (report generation)
- **Professional Financial Reporting**: Structured reports with executive summary, current status, developments, analysis, and outlook
- **Source Verification**: All data includes citations and publication dates for credibility
- **Date-Specific Context**: Every data point includes temporal information for accuracy

#### 🛠️ Technical Implementation

```python
# Financial research with real-time web searches
class FinancialResearcher:
    @agent
    def researcher(self) -> Agent:
        return Agent(
            config=self.agents_config['researcher'],
            tools=[SerperDevTool()],  # Real-time web search
            verbose=True
        )
    
    def run(self):
        inputs = {
            'company': 'Tesla',
            'year': datetime.now().year  # Current year
        }
        return self.crew().kickoff(inputs=inputs)
```

#### 📋 Tech Stack

- **Framework**: CrewAI 1.8+ with multi-agent orchestration
- **AI/ML**: OpenAI GPT models for analysis and reporting
- **Real-Time Search**: SerperDevTool for live financial data and news
- **Configuration**: YAML-based agent and task definitions with mandatory search queries
- **Output Generation**: Professional markdown reports with source citations

#### 🔍 Research Process

1. **Mandatory Web Searches**: Research agent performs 5 required searches:
   - `"{company} stock price {year}"`
   - `"{company} earnings report {year}"`
   - `"{company} news {year}"`
   - `"{company} financial results {year}"`
   - `"{company} market analysis {year}"`

2. **Data Collection**: Gathers current financial data, stock prices, recent news
3. **Professional Analysis**: Creates comprehensive report with insights and projections

#### 💡 Example Usage

```bash
# Setup CrewAI CLI with Python 3.12
uv tool install crewai --python 3.12

# Create and setup project
crewai create crew financial-researcher
cd financial-researcher
crewai install

# Configure environment
cp .env.example .env
# Edit .env with OPENAI_API_KEY and SERPER_API_KEY

# Run financial analysis
crewai run

# Output: Comprehensive financial report with current data
# Tesla Company Analysis Report - 2026
# - Stock Price: $437.86 (as of January 16, 2026)
# - Recent Financial Results: 589,000 vehicles delivered in 2025
# - Market Analysis: Current analyst projections and trends
```

#### 🎯 Advanced Capabilities

- **Customizable Companies**: Analyze any publicly traded company
- **Year-Specific Analysis**: Focus on current year or historical periods
- **Extensible Search**: Add custom search queries for specific financial data
- **Professional Formatting**: Structured markdown reports with proper citations
- **Real-Time Verification**: All data includes sources and publication dates

#### 📊 Example Output

The system generates professional financial reports with:
- **Current Data**: Real-time stock prices and market metrics
- **Recent News**: Latest announcements and developments
- **Financial Analysis**: Professional insights and trend analysis
- **Source Citations**: All data includes sources and dates
- **Future Projections**: Analyst expectations and market outlook

#### 🚀 Production Features

- **Error Handling**: Graceful handling of API limits and search failures
- **Data Validation**: Verification of financial data accuracy and recency
- **Professional Output**: Structured reports suitable for business use
- **Extensible Architecture**: Easy to add new search queries and analysis types

---

### 9. 📈 29-CrewAI-Stock-Picker: Intelligent Investment Analysis System

A sophisticated multi-agent AI system powered by CrewAI that performs comprehensive financial analysis, identifies trending companies, and makes data-driven investment recommendations with real-time market intelligence and persistent learning capabilities.

#### 🎯 Key Features

- **Multi-Agent Architecture**: Manager orchestrates Financial News Analyst, Senior Financial Researcher, and Stock Picker agents
- **Advanced Memory Systems**: Short-term, long-term, and entity memory with ChromaDB vector storage and SQLite persistence
- **Hierarchical Process**: Manager delegates tasks and coordinates workflow for optimal decision-making
- **Real-Time Market Intelligence**: SerperDevTool integration for live web searches and current market data
- **Smart Notifications**: Instant investment recommendations via Pushover with custom branding (📈 AI Stock Picker)
- **Professional Output Generation**: JSON reports with structured data and markdown decisions with detailed rationale

#### 🛠️ Technical Implementation

```python
# Advanced memory systems for persistent learning
class StockPicker:
    @crew
    def crew(self) -> Crew:
        manager = Agent(
            config=self.agents_config['manager'],
            allow_delegation=True
        )
        
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.hierarchical,  # Manager coordination
            memory=True,
            short_term_memory=short_term_memory,    # ChromaDB embeddings
            long_term_memory=long_term_memory,      # SQLite persistence
            entity_memory=entity_memory,            # Entity extraction
            manager_agent=manager
        )
```

#### 📋 Tech Stack

- **Framework**: CrewAI 1.8+ with hierarchical multi-agent orchestration
- **AI/ML**: OpenAI GPT models for analysis and decision-making
- **Memory Systems**: ChromaDB (vector embeddings) + SQLite (structured persistence)
- **Real-Time Search**: SerperDevTool for live financial data and market intelligence
- **Notifications**: Pushover API for instant investment recommendations
- **Data Processing**: Pydantic models for structured JSON validation

#### 🧠 Memory Architecture

**Three-Layer Memory System:**
1. **Short-Term Memory**: ChromaDB with OpenAI embeddings for recent conversations
2. **Long-Term Memory**: SQLite database for persistent knowledge and historical insights
3. **Entity Memory**: Vector embeddings for companies, relationships, and semantic connections

**Learning Benefits:**
- Session 1: Analyzes Tesla → Stores EV market insights
- Session 2: Analyzes Rivian → Recalls Tesla patterns for comparison
- Session 3: Analyzes Lucid → Compares with all previous EV analysis

#### 🔍 Investment Analysis Workflow

1. **Trending Company Discovery**: Real-time news search for current market trends
2. **Deep Financial Research**: Company-specific analysis with market position and outlook
3. **Investment Decision Making**: Comparative analysis with risk-adjusted selection
4. **Instant Notification**: Push notification with decision and rationale

#### 💡 Example Usage

```bash
# Setup CrewAI CLI with Python 3.12
uv tool install crewai --python 3.12

# Create and setup project
crewai create crew stock-picker
cd stock-picker
crewai install

# Configure environment
cp .env.example .env
# Edit .env with OPENAI_API_KEY, SERPER_API_KEY, PUSHOVER_USER, PUSHOVER_TOKEN

# Run investment analysis
crewai run

# Output: Comprehensive investment analysis with memory-enhanced insights
# 📱 Push Notification: 📈 AI Stock Picker - Perplexity AI selected for investment
# 📊 Files: trending_companies.json, research_report.json, decision.md
```

#### 🎯 Advanced Capabilities

- **Persistent Learning**: Memory systems learn from each analysis session
- **Hierarchical Management**: Manager coordinates agent delegation and quality control
- **Real-Time Intelligence**: Live market data with current year context
- **Entity Recognition**: Automatic extraction of companies and relationships
- **Investment Tracking**: Historical decision analysis and performance comparison
- **Customizable Sectors**: Analyze any market sector (Technology, Healthcare, etc.)

#### 📊 Example Output

The system generates comprehensive investment analysis:
- **Trending Companies**: JSON list with current market trends and reasoning
- **Research Reports**: Detailed financial analysis with market position and outlook
- **Investment Decisions**: Rationale for selection and rejected alternatives
- **Memory-Enhanced Insights**: Comparisons with previous analyses and learned patterns

#### 🚀 Production Features

- **Error Handling**: Robust JSON validation and trailing comma prevention
- **Memory Management**: Efficient ChromaDB and SQLite storage systems
- **Data Validation**: Source verification and citation requirements
- **Scalable Architecture**: Modular agent and task configuration
- **Professional Output**: Investment-grade analysis with structured reporting

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

## 🚀 Advanced AI Agent Systems

### 10. 🧠 26-Deep-Research: Multi-Agent Research System

A sophisticated multi-agent research system leveraging OpenAI Agents SDK for automated deep research with web search capabilities, real-time streaming, and comprehensive report generation.

#### 🎯 Core Features

- **Multi-Agent Architecture**: Specialized agents for planning, searching, writing, and email delivery
- **Real-time Web Search**: Integration with OpenAI WebSearchTool for up-to-date information
- **Streaming Interface**: Gradio-based UI with real-time progress updates
- **Automated Reporting**: AI-powered report generation with markdown formatting
- **Email Integration**: Automatic email delivery of research results via Resend API
- **Trace Monitoring**: OpenAI platform integration for debugging and monitoring

#### 🏗️ Technical Implementation

```python
# Multi-agent coordination with streaming
async def run(query: str):
    async for chunk in ResearchManager().run(query):
        yield chunk  # Real-time UI updates

# Specialized agent workflow
1. Planner Agent → Research strategy
2. Search Agent → Web information gathering  
3. Writer Agent → Report synthesis
4. Email Agent → Automated delivery
```

#### 🛠️ Tech Stack

- **AI Framework**: OpenAI Agents SDK (v0.6.4+)
- **UI Framework**: Gradio (v6.3.0) with streaming support
- **Web Search**: OpenAI WebSearchTool integration
- **Email Service**: Resend API for automated delivery
- **Package Management**: UV for modern Python dependency management
- **Environment**: Python 3.14+ with async/await patterns

#### 🚀 Quick Start

```bash
# Clone and setup
git clone <repository>
cd 26-Deep-Research/deep_research

# Install dependencies
uv sync

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run the research UI
uv run deep_research.py

# Or run CLI version
cd .. && uv run main.py
```

#### 📊 Advanced Features

- **Concurrent Search**: Parallel web searches with asyncio
- **Intelligent Planning**: AI-driven research strategy generation
- **Error Handling**: Robust exception management and fallbacks
- **Real-time Tracing**: OpenAI platform integration for debugging
- **Modular Design**: Extensible agent architecture for customization

#### 🎨 User Experience

- **Interactive Interface**: Clean Gradio UI with real-time updates
- **Progress Tracking**: Live status updates during research process
- **Report Export**: Markdown-formatted research reports
- **Email Notifications**: Automatic delivery to specified recipients

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
- **5 production-ready applications** with enterprise features
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
# or
cd 18-AI-agent  # AI Data Generator Agent
# or
cd 21-RAG-AI  # Advanced RAG System
# or
cd 25-openai-agent  # OpenAI Agents Automated SDR System
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
uv run python test_weather.py
# Configure with Claude Desktop or Windsurf using README instructions

# TypeScript Weather Server
cd 17-mcp-servers/01-weather-server-typescript
npm install
npm run build
npm run test
# Configure with Claude Desktop or Windsurf using README instructions

# Auth0 MCP Server (Production)
cd 17-mcp-servers/09-remote-mcp-auth0/mcp-auth0-oidc
npm run build
npm run deploy
# Configure Claude Desktop with OAuth authentication

# Context Engineering
cd 17-mcp-servers/10-context-engineering-mcp
uv sync
fastmcp dev verbose_mcp_server.py
# Development with MCP Inspector

# Agent Skills
cd 17-mcp-servers/11-agent-skills
npm install
npm run dev
# Next.js development server

# AI Data Generator Agent
cd 18-AI-agent
uv sync
cp .env.example .env
# Edit .env with your Google AI API key
uv run main.py
# Start the AI agent

# Multi-Source Research Agent
cd 22-AI-Search-Agent
uv sync
cp .env.example .env
# Edit .env with Bright Data and Google API keys
uv run main.py
# Start the multi-source research agent

# Multi-LLM Evaluation System
cd 23-AI-Agent
uv sync
cp .env.example .env
# Edit .env with OpenAI and Google API keys
uv run main.py
# Compare responses from OpenAI, Gemini, and Ollama

# AI Career Assistant with Tool Use
cd 24-AI-Career-Assistant
uv sync
cp .env.example .env
# Edit .env with OpenAI and Pushover API keys
uv run main.py
# Launch professional career assistant with real-time notifications
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

### 🔗 Live Demonstrations Available Upon Request

### 📧 Contact for recruitment opportunities and technical discussions

### 🌟 Open to challenging roles in Full-Stack Development, AI Engineering, and Backend Systems

---

## 📄 License

All projects are open source and available under the MIT License - see individual project licenses for details.

---

> **💡 Note**: This portfolio represents a journey of continuous learning and technical growth. Each project builds upon previous knowledge, demonstrating the ability to master new technologies and apply them to solve real-world problems.

**🚀 Ready to bring this expertise to your team!**
