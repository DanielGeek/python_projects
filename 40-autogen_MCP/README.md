# 40-autogen_MCP - AutoGen with Model Context Protocol (MCP)

**Category**: Multi-Agent Systems | **Frameworks**: Microsoft AutoGen, MCP | **Language**: Python 3.14+

An advanced multi-agent system demonstrating Microsoft AutoGen's integration with Model Context Protocol (MCP) servers, enabling agents to use external tools through standardized protocol communication.

## 🎯 Key Features

- **🔗 MCP Integration**: Direct connection to MCP servers for tool access
- **🌐 Web Fetching**: Real-time web content retrieval via mcp-server-fetch
- **🤖 Agent Tool Usage**: AssistantAgent with external tool capabilities
- **⚡ Dynamic Tool Loading**: Runtime tool discovery and integration
- **🔄 Protocol Communication**: JSON-RPC based client-server communication
- **📊 Content Processing**: Intelligent web content analysis and summarization

## 🏗️ Architecture

### MCP Server Integration

```python
from autogen_ext.tools.mcp import StdioServerParams, mcp_server_tools

# Configure MCP server connection
fetch_mcp_server = StdioServerParams(
    command="uvx", 
    args=["mcp-server-fetch"], 
    read_timeout_seconds=30
)
fetcher = await mcp_server_tools(fetch_mcp_server)
```

### Agent Configuration

```python
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_ext.tools.mcp import StdioServerParams, mcp_server_tools
from autogen_agentchat.agents import AssistantAgent
from dotenv import load_dotenv

load_dotenv(override=True)

async def main():
    # Get the fetch tool from mcp-server-fetch.
    fetch_mcp_server = StdioServerParams(
        command="uvx", args=["mcp-server-fetch"], read_timeout_seconds=30
    )
    fetcher = await mcp_server_tools(fetch_mcp_server)

    # Create an agent that can use the fetch tool.
    model_client = OpenAIChatCompletionClient(model="gpt-4o-mini")
    agent = AssistantAgent(
        name="fetcher",
        model_client=model_client,
        tools=fetcher,
        reflect_on_tool_use=True,
    )  # type: ignore

    # Let the agent fetch the content of a URL and summarize it.
    result = await agent.run(
        task="Review edwarddonner.com and summarize what you learn. Reply in Markdown."
    )
    print("\n" + "=" * 50)
    print("📝 RESULT:")
    print("=" * 50)
    print(result.messages[-1].content)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

### Communication Flow

```
Agent Request → MCP Server → External Tool → Web Content → Processed Response → Agent Output
```

## 🚀 Getting Started

### Prerequisites

- Python 3.14+
- OpenAI API key
- UV package manager
- Internet connection for MCP server access

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd 40-autogen_MCP
```

2. Install dependencies:

```bash
uv sync
```

3. Set up environment variables:

```bash
# Create .env file
OPENAI_API_KEY=your_openai_api_key_here
```

### Running the Project

```python
uv run main.py
```

## 📊 Example Output

```text
==================================================
📝 RESULT:
==================================================
# Summary of Edward Donner's Website

**Website:** [edwarddonner.com](https://edwarddonner.com)

## Overview
Edward Donner introduces himself on his website as a passionate coder and enthusiast of large language models (LLMs). He expresses a keen interest in writing code, music production, and engaging with tech communities, particularly through sites like Hacker News.

## Professional Background
- **Co-founder and CTO of Nebula.io:** The company focuses on leveraging AI to help individuals realize their potential and fulfill their purpose.
- **Founder and former CEO of untapt:** An AI startup that was acquired in 2021.

## Online Education
Edward has created popular Udemy courses about LLMs, which have gained significant traction, boasting over 400,000 students across 190 countries. He considers this a gratifying achievement and appreciates the support from his students.

## Communication
He invites visitors to keep in touch, assuring that he will send occasional emails that offer value.

## Conclusion
Edward Donner's website highlights his expertise in technology and education, showcasing his contributions to AI and online learning.

For more information, you can explore his full curriculum [here](https://edwarddonner.com/curriculum/).

TERMINATE
```

## 🔧 Configuration

### Agent Setup

- **Model**: `gpt-4o-mini`
- **Tool Reflection**: Enabled (`reflect_on_tool_use=True`)
- **MCP Server**: `mcp-server-fetch` via `uvx`
- **Timeout**: 30 seconds for server communication

### MCP Integration Details

- **Protocol**: JSON-RPC 2.0
- **Transport**: Stdio (standard input/output)
- **Tool Discovery**: Automatic via MCP server capabilities
- **Error Handling**: Graceful degradation with timeout management

## 🎓 Key Learnings

1. **MCP Protocol**: Understanding Model Context Protocol for tool integration
2. **Dynamic Tool Loading**: Runtime tool discovery and integration patterns
3. **Agent Extensibility**: How AutoGen agents can use external tools
4. **Protocol Communication**: JSON-RPC based client-server interactions
5. **Error Resilience**: Handling network timeouts and communication failures
6. **Tool Reflection**: Agent self-analysis of tool usage effectiveness

## 🐛 Troubleshooting

### Common Issues

1. **MCP Server Connection**: Ensure `uvx` is installed and `mcp-server-fetch` is accessible
2. **Timeout Errors**: Increase `read_timeout_seconds` for slow websites
3. **API Key Issues**: Verify OpenAI API key is correctly set in environment
4. **JSON-RPC Errors**: Check MCP server logs for communication issues

### Debug Mode

For debugging MCP communication, you can add logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# This will show JSON-RPC messages between agent and MCP server
```

### Error Recovery

The system includes built-in error handling:

```python
try:
    fetcher = await mcp_server_tools(fetch_mcp_server)
except Exception as e:
    logger.error(f"MCP server connection failed: {e}")
    # Implement fallback or retry logic
```

## 🔗 Dependencies

```toml
dependencies = [
    "autogen-agentchat==0.4.9.3",      # Agent framework
    "autogen-ext>=0.4.0",              # OpenAI and MCP tools
    "autogen-ext-mcp>=0.2.2",          # MCP protocol integration
    "openai>=1.0.0",                   # OpenAI API client
    "python-dotenv>=1.2.1",            # Environment variables
    "tiktoken>=0.5.0",                 # Token counting
]
```

## 🌟 Highlights

- **Protocol Standardization**: Uses industry-standard MCP for tool integration
- **Dynamic Tool Discovery**: Automatic tool capability detection and loading
- **Real-Time Web Access**: Live content fetching and processing
- **Agent Reflection**: Self-monitoring of tool usage effectiveness
- **Error Resilience**: Robust error handling and recovery mechanisms
- **Extensible Architecture**: Easy to add new MCP servers and tools

## 🔍 Advanced Features

- **Multiple MCP Servers**: Support for connecting to multiple MCP servers simultaneously
- **Tool Chaining**: Sequential tool usage for complex workflows
- **Custom Tool Development**: Create and integrate custom MCP tools
- **Performance Monitoring**: Track tool usage and response times
- **Caching Strategies**: Implement intelligent content caching
- **Security Controls**: Tool access restrictions and validation

## 📝 Notes

- The system demonstrates the power of protocol-based tool integration
- MCP provides a standardized way to connect AI agents with external tools
- Dynamic tool loading enables flexible and extensible agent capabilities
- Error handling ensures robust operation in network-dependent scenarios
- The architecture supports both simple and complex multi-tool workflows

## 🚀 Future Enhancements

1. **Multi-Server Support**: Connect to multiple MCP servers simultaneously
2. **Tool Caching**: Implement intelligent caching for frequently accessed content
3. **Custom MCP Tools**: Develop domain-specific MCP tools
4. **Performance Optimization**: Async tool execution and parallel processing
5. **Security Features**: Tool access controls and usage monitoring
6. **Configuration Management**: YAML/JSON configuration for different scenarios
7. **Monitoring Dashboard**: Real-time tool usage and performance metrics

---

**Project Repository**: [40-autogen_MCP](./40-autogen_MCP/)