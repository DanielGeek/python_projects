# Deep Research UI

A modern web interface for AI-powered deep research using OpenAI Agents SDK with real-time streaming and comprehensive report generation.

## 🎯 Overview

This Gradio-based web interface provides an intuitive way to conduct deep research using multiple AI agents. Simply enter your research topic and watch as the system plans searches, gathers information, generates comprehensive reports, and can even email results directly to you.

## ✨ Features

### User Interface

- **Clean Modern Design**: Intuitive Gradio interface with sky theme
- **Real-time Updates**: Watch research progress in real-time
- **Streaming Results**: See status updates as they happen
- **Responsive Layout**: Works on desktop and mobile devices

### Research Capabilities

- **Multi-Agent System**: Specialized agents for different research phases
- **Web Search Integration**: Up-to-date information from the web
- **Intelligent Planning**: AI-driven research strategy
- **Report Generation**: Professional markdown-formatted reports
- **Email Delivery**: Optional email delivery of results

## 🚀 Quick Start

### Prerequisites

- Python 3.14+
- UV package manager
- OpenAI API key

### Installation & Setup

1. **Navigate to the UI directory**

   ```bash
   cd 26-Deep-Research/deep_research
   ```

2. **Install dependencies**

   ```bash
   uv sync
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Launch the interface**

   ```bash
   uv run deep_research.py
   ```

5. **Open your browser**
   - Navigate to the URL shown (usually http://localhost:7860)
   - The interface will open automatically in your browser

## 📖 Usage Guide

### Basic Usage

1. **Enter Your Research Topic**
   - Type your research question in the text box
   - Examples: "Latest AI agent frameworks 2025", "Quantum computing breakthroughs"

2. **Start Research**
   - Click the "Run" button or press Enter
   - Watch the real-time progress updates

3. **View Results**
   - Status updates appear as the research progresses
   - Final report displays in markdown format

### Advanced Features

#### Monitoring Research Progress

The interface shows real-time updates for:

- Trace URL for monitoring on OpenAI platform
- Search planning phase
- Web search execution
- Report generation
- Email delivery (if configured)

#### Email Delivery

Configure email settings in `.env` to receive reports via email:

```env
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=onboarding@resend.dev
TO_EMAIL=your-email@example.com
```

## 🏗️ Architecture

### Agent Workflow

```text
User Input → Planner Agent → Search Agents → Writer Agent → Email Agent → Results
```

### Component Structure

```text
deep_research/
├── deep_research.py      # Main Gradio interface
├── research_manager.py   # Agent orchestration
├── search_agent.py       # Web search functionality
├── planner_agent.py      # Research planning
├── writer_agent.py       # Report generation
├── email_agent.py        # Email delivery
├── pyproject.toml        # Dependencies
└── .env.example          # Environment template
```

## 🛠️ Technical Stack

### Frontend

- **Gradio 6.3.0**: Modern web interface framework
- **Real-time Streaming**: Live progress updates
- **Markdown Rendering**: Rich text report display

### Backend

- **OpenAI Agents SDK 0.6.4+**: Multi-agent orchestration
- **Python 3.14+**: Latest Python features
- **asyncio**: Asynchronous processing
- **pydantic**: Data validation

### External Services

- **OpenAI API**: LLM and web search capabilities
- **Resend API**: Email delivery (optional)

## 📊 Monitoring & Debugging

### OpenAI Tracing

Each research session generates a unique trace URL:

```text
View trace: https://platform.openai.com/traces/trace?trace_id=your_trace_id
```

Use this link to:

- Monitor agent execution in detail
- Debug API calls and responses
- Analyze token usage and costs
- Review the agent decision-making process

### Console Logging

The system provides detailed console output:

```text
View trace: https://platform.openai.com/traces/trace?trace_id=...
Starting research...
Planning searches...
Will perform 3 searches
Searching... 1/3 completed
Searching... 2/3 completed
Searching... 3/3 completed
Finished searching
Thinking about report...
Finished writing report
Writing email...
Email sent
```

## 🎨 Customization

### Interface Customization

Modify `deep_research.py` to customize:

- Theme colors and styling
- Input field labels
- Button appearance
- Layout structure

### Agent Behavior

Update agent files to modify:

- Search parameters and sources
- Report formatting and style
- Email templates and delivery
- Research planning strategy

## 🚨 Troubleshooting

### Common Issues

#### Interface Won't Start

```bash
# Check dependencies
uv sync

# Verify Python version
python --version  # Should be 3.14+

# Check for port conflicts
lsof -i :7860
```

#### Research Fails

- **API Key Issues**: Verify OpenAI API key in `.env`
- **Network Problems**: Check internet connection
- **Rate Limits**: Monitor OpenAI API usage
- **Trace Debugging**: Use the provided trace URL

#### Email Not Sending

- **Resend Configuration**: Verify API key and settings
- **Email Addresses**: Check sender/recipient emails
- **Resend Dashboard**: Review delivery status

### Performance Tips

#### Faster Research

- Use specific, focused research topics
- Monitor token usage in OpenAI dashboard
- Consider search result limits

#### Better Reports

- Provide clear, specific research questions
- Allow sufficient time for comprehensive analysis
- Review generated traces for optimization

## 🔧 Development

### Running in Development Mode

```bash
# Start with auto-reload (if implemented)
uv run deep_research.py --dev

# Or with verbose logging
uv run deep_research.py --verbose
```

### Adding New Features

1. Create new agent files in the same directory
2. Import and integrate in `research_manager.py`
3. Update the UI in `deep_research.py` if needed
4. Add dependencies to `pyproject.toml`

### Testing

```bash
# Run tests (if available)
uv run pytest

# Test specific components
uv run python -m pytest test_search_agent.py
```

## 📈 Usage Examples

### Academic Research

```text
Input: "Recent advances in CRISPR gene editing 2025"
Output: Comprehensive report with latest findings, applications, and future directions
```

### Market Research

```text
Input: "Electric vehicle market trends and forecasts"
Output: Detailed analysis of market size, growth trends, key players, and predictions
```

### Technology Research

```text
Input: "Comparison of cloud computing platforms 2025"
Output: In-depth comparison of AWS, Azure, GCP with features, pricing, and use cases
```

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards

- Follow PEP 8 guidelines
- Use type hints
- Add docstrings
- Update documentation

## 📄 License

This project is open source under the MIT License.

---

**Built with ❤️ using Gradio and OpenAI Agents SDK**

For the full project documentation, see the [main README](../README.md).