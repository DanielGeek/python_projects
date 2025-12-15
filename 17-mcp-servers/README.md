# MCP Servers Collection

## 📋 Overview

This repository contains a comprehensive collection of Model Context Protocol (MCP) servers for learning and development. MCP enables AI assistants to access tools and resources through standardized protocols, enhancing development workflows and AI-powered capabilities.

## 🗂 Repository Structure

```text
17-mcp-servers/
├── 01-weather-server-typescript/    # Weather MCP server in TypeScript
├── 02-weather-server-python/        # Weather MCP server in Python
├── 03-mcpdoc/                       # Documentation MCP server
├── MCP_REFERENCE.md                 # Comprehensive MCP reference guide
└── README.md                        # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+ (for Python servers)
- Node.js 18+ (for TypeScript servers)
- UV package manager
- npm or yarn

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-org/17-mcp-servers.git
   cd 17-mcp-servers
   ```

2. **Install UV (Python package manager):**

   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

3. **Setup individual servers:** (See each server's directory for specific instructions)

## 🛠 Available MCP Servers

### 1. Weather Server (TypeScript)

**Directory:** `01-weather-server-typescript/`

**Purpose:** Provides weather data access through MCP protocol.

**Features:**

- Real-time weather information
- Weather alerts and warnings
- Location-based forecasts
- NWS API integration

**Quick Start:**

```bash
cd 01-weather-server-typescript
npm install
npm run build
# Configure in your MCP client using build/index.js
```

**Use Cases:**

- AI assistants needing weather context
- Travel planning applications
- Outdoor activity recommendations
- Weather-aware scheduling

### 2. Weather Server (Python)

**Directory:** `02-weather-server-python/`

**Purpose:** Python implementation of weather data access via MCP.

**Features:**

- FastMCP framework integration
- Async/await support
- Error handling and retries
- Clean, typed interfaces

**Quick Start:**

```bash
cd 02-weather-server-python
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt
python weather.py
```

**Use Cases:**

- Python-based AI applications
- Integration with existing Python ecosystems
- Educational purposes for MCP development
- Prototyping and testing

### 3. MCPDoc Server

**Directory:** `03-mcpdoc/`

**Purpose:** Provides access to technical documentation through MCP.

**Features:**

- LangGraph documentation access
- LangChain documentation integration
- Real-time documentation fetching
- IDE integration support

**Quick Start:**

```bash
cd 03-mcpdoc
uv venv
source .venv/bin/activate
uv pip install .
uvx --from mcpdoc mcpdoc \
    --urls "LangGraph:https://langchain-ai.github.io/langgraph/llms.txt" \
    --transport stdio
```

**Use Cases:**

- AI-assisted coding with official documentation
- Real-time API reference lookup
- Learning and development with LangGraph/LangChain
- Context-aware code suggestions

## 🔧 Configuration Guide

### Claude Desktop Setup

1. **Edit configuration file:**

   ```bash
   # macOS
   open ~/Library/Application\ Support/Claude/claude_desktop_config.json
   
   # Windows
   notepad %APPDATA%\Claude\claude_desktop_config.json
   ```

2. **Add server configuration:**

   ```json
   {
     "mcpServers": {
       "weather-python": {
         "command": "/Users/thepunisher/.local/bin/uv",
         "args": [
           "run",
           "--directory",
           "/path/to/17-mcp-servers/02-weather-server-python",
           "python",
           "weather.py"
         ]
       },
       "langgraph-docs-mcp": {
         "command": "/Users/thepunisher/.local/bin/uvx",
         "args": [
           "--from",
           "mcpdoc",
           "mcpdoc",
           "--urls",
           "LangGraph:https://langchain-ai.github.io/langgraph/llms.txt",
           "--transport",
           "stdio"
         ]
       }
     }
   }
   ```

3. **Restart Claude Desktop**

### Windsurf Setup

1. **Edit configuration file:**

   ```bash
   open ~/.codeium/windsurf/mcp_config.json
   ```

2. **Add server configuration:**

   ```json
   {
     "mcpServers": {
       "weather": {
         "command": "node",
         "args": ["/path/to/17-mcp-servers/01-weather-server-typescript/build/index.js"]
       },
       "langgraph-docs-mcp": {
         "command": "uvx",
         "args": [
           "--from", "mcpdoc", "mcpdoc",
           "--urls", "LangGraph:https://langchain-ai.github.io/langgraph/llms.txt",
           "--transport", "stdio"
         ]
       }
     }
   }
   ```

### Cursor Setup

1. **Edit configuration file:**

   ```bash
   open ~/.cursor/mcp.json
   ```

2. **Add server configuration:** (Same format as above)

## 📚 Usage Examples

### Weather Information

```text
User: "What's the weather like in New York?"
Claude: [Uses weather MCP server] 
→ "Currently in New York: 72°F, partly cloudy with a 20% chance of rain."
```

### Documentation Lookup

```text
User: "How do I implement memory in LangGraph?"
Claude: [Uses MCPDoc server]
→ [Fetches official documentation] 
→ "Here's how to implement memory in LangGraph using MemorySaver..."
```

### Combined Usage

```text
User: "Plan an outdoor meeting for tomorrow considering weather"
Claude: [Uses both weather and documentation servers]
→ "Based on tomorrow's forecast (sunny, 75°F) and best practices from documentation..."
```

## 🎯 Development Workflow

1. **Local Development:**

   ```bash
   # Start weather server
   cd 02-weather-server-python
   python weather.py
   
   # Start documentation server
   cd 03-mcpdoc
   uvx --from mcpdoc mcpdoc --urls "LangGraph:https://..."
   ```

2. **Testing with MCP Inspector:**

   ```bash
   npx @modelcontextprotocol/inspector
   # Connect to your server for testing
   ```

3. **IDE Integration:**

   - Configure your preferred IDE (Claude, Windsurf, Cursor)
   - Test MCP tools are working
   - Start development with enhanced AI assistance

### Custom Server Development

1. **Create new server directory:**

   ```bash
   mkdir 04-my-custom-server
   cd 04-my-custom-server
   ```

2. **Initialize Python server:**

   ```bash
   uv init
   uv add mcp fastmcp
   ```

3. **Implement your tools:**

   ```python
   from mcp.server.fastmcp import FastMCP
   
   mcp = FastMCP("my-server")
   
   @mcp.tool()
   def my_tool(param: str) -> str:
       return f"Processed: {param}"
   
   if __name__ == "__main__":
       mcp.run()
   ```

## 🔍 Available Tools

### Weather Server Tools

- `get-forecast`: Get weather forecast for a location
- `get-alerts`: Get weather alerts for a location

### MCPDoc Server Tools

- `list_doc_sources`: List available documentation sources
- `fetch_docs`: Fetch documentation from specific URLs

## 🛠 Development Commands

### Common Commands

```bash
# Setup virtual environment (Python servers)
uv venv && source .venv/bin/activate

# Install dependencies
uv pip install -r requirements.txt

# Run Python server
python server.py

# Build TypeScript server
npm run build

# Test with MCP Inspector
npx @modelcontextprotocol/inspector

# Install MCPDoc for documentation access
uvx --from mcpdoc mcpdoc --help
```

### Server-Specific Commands

```bash
# Weather Server (Python)
cd 02-weather-server-python
python weather.py

# Weather Server (TypeScript)
cd 01-weather-server-typescript
npm run build
node build/index.js

# Documentation Server
cd 03-mcpdoc
uvx --from mcpdoc mcpdoc --urls "LangGraph:https://..." --transport stdio
```

## 🚨 Troubleshooting

### Common Issues

1. **"Command not found: uvx"**

   ```bash
   # Install UV
   curl -LsSf https://astral.sh/uv/install.sh | sh
   # Restart terminal
   ```

2. **"Port already in use"**

   ```bash
   # Find and kill process
   lsof -i :8082
   kill -9 <PID>
   ```

3. **"MCP server not connecting"**

   - Check configuration file paths
   - Verify server is running
   - Check firewall settings
   - Review logs in your IDE

4. **"Documentation not loading"**

   ```bash
   # Test URL accessibility
   curl https://langchain-ai.github.io/langgraph/llms.txt
   
   # Check network connectivity
   ping langchain-ai.github.io
   ```

### Debug Mode

Enable debug logging:

```bash
export LOG_LEVEL=debug
python weather.py
```

## 📖 Additional Resources

- [MCP Protocol Specification](https://modelcontextprotocol.io/specification)
- [FastMCP Documentation](https://github.com/modelcontextprotocol/python-sdk)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
- [UV Package Manager](https://docs.astral.sh/uv/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your MCP server
4. Update documentation
5. Submit a pull request

### Adding New Servers

1. Create new directory: `XX-server-name/`
2. Add README.md with server description
3. Implement server with proper error handling
4. Add configuration examples
5. Update this main README.md

## 📄 License

This project is an open-source educational initiative. See individual server directories for specific licensing information.

## 🆘 Support

For issues and questions:

- Create an issue in the repository
- Check the troubleshooting section above
- Review the MCP_REFERENCE.md for detailed technical information
- Join our development discussions

---

**Last Updated:** December 2024

**Version:** 1.0.0

**Maintainer:** MCP Development Community

## 🔗 Quick Links

- [MCP Reference Guide](./MCP_REFERENCE.md) - Comprehensive MCP documentation
- [Weather Server (Python)](./02-weather-server-python/) - Python weather implementation
- [Weather Server (TypeScript)](./01-weather-server-typescript/) - TypeScript weather implementation
- [Documentation Server](./03-mcpdoc/) - MCPDoc for technical documentation
