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
uv add langchain-mcp-adapters langgraph "langchain[openai]" "langchain[google-genai]" python-dotenv isort
```

## Configuration

### Environment Variables Setup

Create a `.env` file with your API keys:

```env
# Required - OpenAI API Key
OPENAI_API_KEY=sk-your-openai-api-key-here

# Required - Google API Key (for Google services)
GOOGLE_API_KEY=your-google-api-key-here

# Required - LangSmith for tracing/monitoring
LANGCHAIN_API_KEY=lsv2_your-langsmith-api-key-here
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
LANGCHAIN_PROJECT=default
```

### Create LangSmith Account & API Key

1. **Sign up for free**: [LangSmith](https://smith.langchain.com)
   - Supports Google, GitHub, or email sign-in

2. **Create API Key**: [Create Account & API Key](https://docs.langchain.com/langsmith/create-account-api-key)
   - Go to Settings → API Keys
   - Select **"Personal Access Token"** (recommended for individual development)
   - Choose workspace scope or organization-wide
   - Set expiration (choose "Never" for development)
   - **Copy the key immediately** - it only shows once!

3. **Configure your project**:
   - Free plan includes 1 project, 5,000 traces/month, 14-day retention
   - Perfect for development and learning

### Quick Setup Commands

```bash
# Activate virtual environment
source .venv/bin/activate

# Install dependencies
uv add langchain-mcp-adapters langgraph "langchain[openai]" python-dotenv

# Create and edit .env file
cp .env.example .env
# Edit .env with your actual API keys

# Test environment variables
uv run main.py
```

## Installed Dependencies

- **langchain-mcp-adapters** (v0.2.1) - MCP integration with LangChain
- **langgraph** (v1.0.5) - Framework for agents
- **langchain** (v1.2.0) - Main framework
- **langchain-openai** (v1.1.3) - OpenAI integration
- **langchain-google-genai** - Google AI (Gemini) integration
- **mcp** (v1.24.0) - MCP SDK
- **python-dotenv** - Environment variable management

## Run Project

### Client Application

```bash
# Run the main client application
uv run main.py
```

### MCP Servers

The project includes example MCP servers that can be run independently:

```bash
# Run Math Server (provides add/multiply tools)
uv run servers/math_server.py

# Run Weather Server (provides weather tool)
uv run servers/weather_server.py
```

**Note**: Run each server in a separate terminal window when testing multi-server integration.

## Code Structure

### Environment Variable Loading

The project now includes automatic environment variable loading:

```python
import asyncio
from dotenv import load_dotenv
import os

load_dotenv()
print(os.getenv("GOOGLE_API_KEY"))

async def main():
    print("Hello from 06-langchain-mcp-adapters!")

if __name__ == "__main__":
    asyncio.run(main())
```

This setup:

- ✅ **Loads environment variables** from `.env` automatically
- ✅ **Tests API keys** are properly loaded before running
- ✅ **Provides feedback** when configuration is successful

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

# OpenAI
from langchain_openai import ChatOpenAI
llm = ChatOpenAI(model="gpt-4")

# Google AI (Gemini)
from langchain_google_genai import ChatGoogleGenerativeAI
llm = ChatGoogleGenerativeAI(model="gemini-pro")

# Connect multiple MCP servers
client = MultiServerMCPClient({
    "zoom": {"url": "http://localhost:8000/mcp"},
    "docs": {"command": "python", "args": ["doc_server.py"]}
})

# Create agent with MCP tools
tools = await client.get_tools()
agent = create_agent(llm, tools)
```
