# MCPDoc - Documentation Server Commands

## 📋 Overview

MCPDoc is a powerful Model Context Protocol (MCP) server that provides access to technical documentation from various sources. This guide covers setup, configuration, and integration with popular IDEs and AI assistants.

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- UV package manager
- Node.js (for MCP Inspector)

## 📦 Setup Commands

### 1. Create Virtual Environment

```bash
uv venv
```

**Purpose:** Creates an isolated Python environment for MCPDoc dependencies.

**Why needed:** Prevents conflicts with system Python packages and other projects.

### 2. Activate Virtual Environment

```bash
source .venv/bin/activate
```

**Purpose:** Activates the virtual environment.

**Why needed:** Ensures all commands run within the isolated environment.

### 3. Install MCPDoc Package

```bash
uv pip install .
```

**Purpose:** Installs MCPDoc and its dependencies in development mode.

**Why needed:** Makes the mcpdoc command available for local testing and development.

### 4. Verify UV Installation

```bash
which uv
```

**Purpose:** Confirms UV is installed and shows its location.

**Why needed:** Ensures the package manager is properly configured before proceeding.

### 5. Start MCPDoc Server (Development)

```bash
uvx --from mcpdoc mcpdoc \
    --urls "LangGraph:https://langchain-ai.github.io/langgraph/llms.txt" "LangChain:https://python.langchain.com/llms.txt" \
    --transport sse \
    --port 8082 \
    --host localhost
```

**Purpose:** Starts MCPDoc server with LangGraph and LangChain documentation.

**Parameters:**

- `--urls`: Documentation sources (LangGraph + LangChain)
- `--transport sse`: Uses Server-Sent Events for communication
- `--port 8082`: Server runs on localhost:8082
- `--host localhost`: Binds to localhost only

**Why needed:** Provides local testing environment for MCPDoc functionality.

### 6. Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector
```

**Purpose:** Opens MCP Inspector in browser for testing.

**Steps:**

1. Browser window opens automatically
2. Select "SSE" transport type
3. Enter URL: `http://localhost:8082/sse`
4. Click "Connect" to test MCPDoc

**Why needed:** Allows interactive testing of MCPDoc tools and documentation fetching.

## 🔧 IDE Configuration

### Windsurf Configuration

**File:** `~/.codeium/windsurf/mcp_config.json`

```json
{
  "mcpServers": {
    "langgraph-docs-mcp": {
      "command": "uvx",
      "args": [
        "--from",
        "mcpdoc",
        "mcpdoc",
        "--urls",
        "LangGraph:https://langchain-ai.github.io/langgraph/llms.txt",
        "LangChain:https://python.langchain.com/llms.txt",
        "--transport",
        "stdio"
      ]
    }
  }
}
```

**Purpose:** Integrates MCPDoc with Windsurf IDE.

**Transport:** Uses stdio for direct communication.

**Documentation Sources:** LangGraph and LangChain official docs.

**Benefits:**

- Real-time documentation lookup in Windsurf
- AI-assisted coding with official examples
- Context-aware suggestions from official docs

### Claude Desktop Configuration

**File:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
    "mcpServers": {
        "langgraph-docs-mcp": {
            "command": "/Users/thepunisher/.local/bin/uvx",
            "args": [
                "--from",
                "mcpdoc",
                "mcpdoc",
                "--urls",
                "LangGraph:https://langchain-ai.github.io/langgraph/llms.txt",
                "LangChain:https://python.langchain.com/llms.txt",
                "--transport",
                "stdio"
            ]
        }
    }
}
```

**Purpose:** Integrates MCPDoc with Claude Desktop.

**Key Differences:**

- Uses absolute path to uvx for reliability
- Same stdio transport for direct communication
- Same documentation sources

**Benefits:**

- Access to official LangGraph/LangChain documentation
- AI-powered code examples and explanations
- Real-time answers from official sources
- Up-to-date API references and best practices

## 🛠 Available MCP Tools

### 1. `list_doc_sources`

**Purpose:** Lists all available documentation sources.

**Usage:** Call this first to see what documentation is available.

**Returns:** List of configured documentation sources with URLs.

### 2. `fetch_docs`

**Purpose:** Fetches documentation from specific URLs.

**Parameters:**

- `url`: Documentation URL to fetch

**Usage:** Use after listing sources to get specific documentation.

**Returns:** Formatted documentation content in markdown.

## 📚 Documentation Sources

### LangGraph Documentation

- **URL:** `https://langchain-ai.github.io/langgraph/llms.txt`
- **Content:** Building stateful, multi-actor applications with LLMs
- **Topics:** Agents, memory, streaming, deployment, best practices
- **Use Cases:** Conversational AI, workflow automation, multi-agent systems

### LangChain Documentation

- **URL:** `https://python.langchain.com/llms.txt`
- **Content:** Building applications with LLMs through composability
- **Topics:** Chains, agents, memory, document processing, RAG
- **Use Cases:** Document processing, question answering, data analysis

## 🎯 Common Use Cases

### 1. Learning LangGraph Memory

```text
User: "What are the types of memory in LangGraph?"
Claude: Uses list_doc_sources → fetch_docs → Provides detailed explanation
```

### 2. Implementing Agents

```text
User: "How do I create a streaming agent with LangGraph?"
Claude: Fetches official examples → Provides working code → Explains best practices
```

### 3. Troubleshooting

```text
User: "My agent is stuck in a loop"
Claude: Fetches troubleshooting docs → Identifies common issues → Provides solutions
```

## 🔍 Tips and Best Practices

### Development Workflow

1. **Start Local:** Use MCPDoc server for initial testing
2. **Test Thoroughly:** Use MCP Inspector to validate functionality
3. **Configure IDE:** Add to Windsurf/Claude for daily use
4. **Update Sources:** Add new documentation sources as needed

### Performance Optimization

- Use specific URLs rather than broad documentation
- Consider timeout settings for large documentation
- Monitor memory usage with multiple sources

### Security Considerations

- Only allow trusted documentation domains
- Use HTTPS for all documentation sources
- Regular updates to ensure latest security patches

## 🚨 Troubleshooting

### Common Issues

1. **"No such file or directory"**

   - Check uvx installation path
   - Verify virtual environment is activated

2. **"Unexpected argument '--from'"**

   - Use `uvx` instead of `uv`
   - Ensure UV is properly installed

3. **Connection refused**

   - Check if MCPDoc server is running
   - Verify port is not in use
   - Check firewall settings

4. **Documentation not loading**

   - Verify URLs are accessible
   - Check internet connection
   - Review allowed domains configuration

## 📖 Additional Resources

- [MCP Protocol Specification](https://modelcontextprotocol.io/specification)
- [LangGraph Official Docs](https://langchain-ai.github.io/langgraph/)
- [LangChain Official Docs](https://python.langchain.com/)
- [MCP Inspector GitHub](https://github.com/modelcontextprotocol/inspector)
- [UV Package Manager](https://docs.astral.sh/uv/)

---

**Last Updated:** December 2024

**Version:** MCPDoc 0.10.0

**Maintainer:** MCP Development Community
