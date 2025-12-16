# LangChain MCP Adapters

## What is this project?

This project demonstrates how to use **LangChain MCP Adapters** to integrate MCP (Model Context Protocol) tools with intelligent LangChain/LangGraph agents.

## Installation

### 1. Activate virtual environment

```bash
source .venv/bin/activate
```

### 2. Install dependencies

```bash
uv add langchain-mcp-adapters langgraph "langchain[openai]" python-dotenv
```

## Configuration

### Configure OpenAI API Key

```bash
export OPENAI_API_KEY=your_api_key_here
```

Or create `.env` file:

```env
OPENAI_API_KEY=your_api_key_here
```

## Installed Dependencies

- **langchain-mcp-adapters** (v0.2.1) - MCP integration with LangChain
- **langgraph** (v1.0.5) - Framework for agents
- **langchain** (v1.2.0) - Main framework
- **langchain-openai** (v1.1.3) - OpenAI integration
- **mcp** (v1.24.0) - MCP SDK
- **python-dotenv** - Environment variable management

## Run Project

```bash
# Run basic example
uv run main.py
```

## Official Documentation

- **LangChain MCP Adapters**: https://github.com/langchain-ai/langchain-mcp-adapters
- **Examples and tutorials**: https://github.com/langchain-ai/langchain-mcp-adapters/tree/main/examples

## Use Cases

1. **Agents using MCP tools** for meeting automation
2. **Multi-server integration** of MCP servers (Zoom + Transcription + Documentation)
3. **Complex workflows** with LangGraph for audio processing

## Basic Example

```python
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.agents import create_agent

# Connect multiple MCP servers
client = MultiServerMCPClient({
    "zoom": {"url": "http://localhost:8000/mcp"},
    "docs": {"command": "python", "args": ["doc_server.py"]}
})

# Create agent with MCP tools
tools = await client.get_tools()
agent = create_agent("openai:gpt-4.1", tools)
```
