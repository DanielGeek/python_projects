# 26-Deep-Research: Multi-Agent Research System

A sophisticated multi-agent research system leveraging OpenAI Agents SDK for automated deep research with web search capabilities, real-time streaming, and comprehensive report generation.

## 🎯 Features

### Core Capabilities

- **Multi-Agent Architecture**: Specialized agents for planning, searching, writing, and email delivery
- **Real-time Web Search**: Integration with OpenAI WebSearchTool for up-to-date information
- **Streaming Interface**: Gradio-based UI with real-time progress updates
- **Automated Reporting**: AI-powered report generation with markdown formatting
- **Email Integration**: Automatic email delivery of research results via Resend API
- **Trace Monitoring**: OpenAI platform integration for debugging and monitoring

### Technical Features

- **Concurrent Search**: Parallel web searches with asyncio
- **Intelligent Planning**: AI-driven research strategy generation
- **Error Handling**: Robust exception management and fallbacks
- **Real-time Tracing**: OpenAI platform integration for debugging
- **Modular Design**: Extensible agent architecture for customization

## 🏗️ Architecture

### Agent System

```text
Research Manager
├── Planner Agent → Research strategy generation
├── Search Agent → Web information gathering
├── Writer Agent → Report synthesis
└── Email Agent → Automated delivery
```

### Project Structure

```text
26-Deep-Research/
├── main.py                    # CLI version
├── pyproject.toml            # CLI dependencies
├── deep_research/
│   ├── deep_research.py      # Gradio UI
│   ├── research_manager.py   # Core orchestration
│   ├── search_agent.py       # Web search agent
│   ├── planner_agent.py      # Research planning
│   ├── writer_agent.py       # Report generation
│   ├── email_agent.py        # Email delivery
│   ├── pyproject.toml        # UI dependencies
│   └── .env.example          # Environment template
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.14+
- UV package manager
- OpenAI API key
- Resend API key (for email delivery)

### Installation

#### CLI Version

```bash
# Navigate to project root
cd 26-Deep-Research

# Install dependencies
uv sync

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run CLI version
uv run main.py
```

#### UI Version (Recommended)

```bash
# Navigate to UI directory
cd deep_research

# Install dependencies
uv sync

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run Gradio UI
uv run deep_research.py
```

### Environment Configuration

Create `.env` file with:

```env
# OpenAI API Key (required)
OPENAI_API_KEY=your-openai-api-key

# Email Configuration (optional)
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=onboarding@resend.dev
TO_EMAIL=your-email@example.com
```

## 📖 Usage

### CLI Interface

```bash
# Run with default query
uv run main.py

# The CLI will search for "Latest AI Agent frameworks in 2025"
# and display results in the terminal
```

### Web Interface

1. Launch the Gradio UI: `uv run deep_research.py`
2. Open your browser to the provided URL (usually http://localhost:7860)
3. Enter your research topic in the text box
4. Click "Run" or press Enter
5. Watch real-time progress updates
6. Receive the final research report

### Example Research Topics

- "Latest developments in quantum computing 2025"
- "Sustainable energy storage solutions"
- "AI applications in healthcare"
- "Emerging programming languages and frameworks"

## 🔧 Development

### Adding New Agents

1. Create new agent file in `deep_research/`
2. Define agent with OpenAI Agents SDK
3. Import and integrate in `research_manager.py`
4. Update dependencies in `pyproject.toml`

### Customizing Search Behavior

Edit `search_agent.py` to modify:

- Search result processing
- Source filtering
- Content summarization logic

### Extending Report Generation

Modify `writer_agent.py` to:

- Change report format
- Add citations
- Implement different writing styles

## 🛠️ Technical Stack

### Core Dependencies

- **openai-agents**: OpenAI Agents SDK (v0.6.4+)
- **gradio**: Web UI framework (v6.3.0)
- **python-dotenv**: Environment management
- **resend**: Email delivery service

### Development Tools

- **UV**: Modern Python package manager
- **Python 3.14+**: Latest Python features
- **asyncio**: Asynchronous programming
- **pydantic**: Data validation

## 📊 Monitoring & Debugging

### OpenAI Tracing

Every research session generates a trace ID:

```text
View trace: https://platform.openai.com/traces/trace?trace_id=trace_12345
```

Use this link to:

- Monitor agent execution
- Debug API calls
- Analyze token usage
- Review decision-making process

### Logging

The system provides console logging for:

- Search progress
- Agent execution status
- Error messages
- Email delivery confirmation

## 🚨 Troubleshooting

### Common Issues

#### Module Not Found Errors

```bash
# Ensure you're in the correct directory
cd deep_research  # for UI version
cd ..             # for CLI version

# Reinstall dependencies
uv sync
```

#### API Key Issues

- Verify `.env` file exists in correct directory
- Check API key validity
- Ensure sufficient OpenAI credits

#### Search Failures

- Check internet connection
- Verify OpenAI API access
- Review trace logs for specific errors

#### Email Delivery Issues

- Verify Resend API configuration
- Check sender/recipient email addresses
- Review Resend dashboard for delivery status

## 🤝 Contributing

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd 26-Deep-Research

# Setup development environment
cd deep_research
uv sync

# Run tests (if available)
uv run pytest

# Start development server
uv run deep_research.py
```

### Code Style

- Follow PEP 8 guidelines
- Use type hints where applicable
- Add docstrings for new functions
- Update documentation for new features

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Related Projects

- **25-OpenAI-Agent**: Multi-model SDR automation system
- **24-Groq-App**: LLM-powered application development
- **23-Python-API**: RESTful API development with Django

---

**Built with ❤️ using OpenAI Agents SDK and modern Python practices**
