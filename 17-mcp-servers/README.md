# MCP Servers Collection

## 📋 Overview

This repository contains a comprehensive collection of Model Context Protocol (MCP) servers for learning and development. MCP enables AI assistants to access tools and resources through standardized protocols, enhancing development workflows and AI-powered capabilities.

## 🗂 Repository Structure

```text
17-mcp-servers/
├── 01-weather-server-typescript/    # Weather MCP server in TypeScript
├── 02-weather-server-python/        # Weather MCP server in Python
├── 03-mcpdoc/                       # Documentation MCP server
├── 04-shellserver/                  # Shell command MCP server
├── 05-mcp-doc-server/               # MCP documentation server
├── 06-langchain-mcp-adapters/       # LangChain MCP integration
├── 07-prompts/                      # MCP prompt engineering
├── 08-resources/                    # MCP resources and tools
├── 09-remote-mcp-auth0/             # Auth0 OAuth MCP server
├── 10-context-engineering-mcp/      # Context optimization MCP
├── 11-agent-skills/                 # Multi-agent skills system
├── MCP_REFERENCE.md                 # Comprehensive MCP reference guide
├── COMMANDS.md                      # MCP commands reference
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

### 4. Shell Server

**Directory:** `04-shellserver/`

**Purpose:** Secure shell command execution through MCP.

**Features:**

- Safe shell command execution
- Command validation and filtering
- Output capture and streaming
- Security-focused design

**Quick Start:**

```bash
cd 04-shellserver
uv sync
source .venv/bin/activate
python server.py
```

**Use Cases:**

- Automated system administration
- Development workflow automation
- File system operations
- Process management

### 5. MCP Documentation Server

**Directory:** `05-mcp-doc-server/`

**Purpose:** Dedicated MCP server for documentation access.

**Features:**

- FastMCP framework
- Multiple documentation sources
- Real-time content fetching
- Windsurf integration

**Quick Start:**

```bash
cd 05-mcp-doc-server
uv sync
source .venv/bin/activate
python server.py
```

### 6. LangChain MCP Adapters

**Directory:** `06-langchain-mcp-adapters/`

**Purpose:** Integration between LangChain and MCP protocols.

**Features:**

- LangChain agent integration
- MCP tool adapters
- Multi-agent coordination
- Advanced AI workflows

**Quick Start:**

```bash
cd 06-langchain-mcp-adapters
uv sync
source .venv/bin/activate
python main.py
```

### 7. MCP Prompts

**Directory:** `07-prompts/`

**Purpose:** Prompt engineering templates and examples.

**Features:**

- MCP prompt templates
- Best practices documentation
- Example implementations
- Performance optimization

### 8. MCP Resources

**Directory:** `08-resources/`

**Purpose:** Collection of MCP tools and utilities.

**Features:**

- Development tools
- Testing utilities
- Configuration examples
- Performance monitors

### 9. Remote MCP Auth0

**Directory:** `09-remote-mcp-auth0/`

**Purpose:** Production-ready MCP server with OAuth 2.0 authentication.

**Features:**

- Auth0 OAuth 2.0 integration
- Cloudflare Workers deployment
- JWT token management
- Enterprise security
- Remote MCP connections
- Production monitoring

**Quick Start:**

```bash
cd 09-remote-mcp-auth0/mcp-auth0-oidc
npm install
npm run build
npm run deploy  # Deploy to Cloudflare Workers
```

**Deployed Endpoints:**

- MCP Server: `https://mcp-auth0-oidc.todos-api-danielgeek.workers.dev`
- Todos API: `https://api.todos-api-danielgeek.workers.dev`

**Use Cases:**

- Enterprise MCP deployments
- Secure remote AI assistant access
- Production API integrations
- Multi-tenant MCP services

### 10. Context Engineering MCP

**Directory:** `10-context-engineering-mcp/`

**Purpose:** Optimized MCP servers for context management.

**Features:**

- Token usage optimization
- Context window management
- Performance monitoring
- FastMCP 2.12.4+ features

**Quick Start:**

```bash
cd 10-context-engineering-mcp
uv sync
fastmcp dev verbose_mcp_server.py
```

**Use Cases:**

- AI assistant optimization
- Token cost reduction
- Context engineering
- Performance tuning

### 11. Agent Skills

**Directory:** `11-agent-skills/`

**Purpose:** Multi-agent system with specialized capabilities.

**Features:**

- Next.js frontend
- Multi-agent orchestration
- Specialized skill modules
- Real-time coordination

**Quick Start:**

```bash
cd 11-agent-skills
npm install
npm run dev
```

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
       },
       "todos": {
         "command": "/Users/thepunisher/.nvm/versions/node/v24.9.0/bin/node",
         "args": [
           "/path/to/17-mcp-servers/09-remote-mcp-auth0/mcp-auth0-oidc/mcp-remote-wrapper.js",
           "https://mcp-auth0-oidc.todos-api-danielgeek.workers.dev/sse"
         ]
       },
       "context-engineering": {
         "command": "/Users/thepunisher/.local/bin/uv",
         "args": [
           "run",
           "--directory",
           "/path/to/17-mcp-servers/10-context-engineering-mcp",
           "fastmcp",
           "dev",
           "verbose_mcp_server.py"
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
       },
       "todos": {
         "command": "/Users/thepunisher/.nvm/versions/node/v24.9.0/bin/node",
         "args": [
           "/path/to/17-mcp-servers/09-remote-mcp-auth0/mcp-auth0-oidc/mcp-remote-wrapper.js",
           "https://mcp-auth0-oidc.todos-api-danielgeek.workers.dev/sse"
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

### Claude Code CLI Setup

1. **Project-specific MCP config:**

```bash
# For context engineering
cd 10-context-engineering-mcp
claude --mcp-config .mcp-json.tavily

# For remote MCP with Auth0
cd 09-remote-mcp-auth0
claude --mcp-config .mcp.json
```

1. **Available MCP configurations:**

- `.mcp.json` - Full server configuration
- `.mcp-json.tavily` - Tavily search only
- `.mcp-json.context7` - Context7 integration
- `.mcp-json.playwright` - Browser automation

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

### Authenticated API Access

```text
User: "List my todos and billing information"
Claude: [Uses Auth0 MCP server with OAuth]
→ [Authenticates with Auth0] 
→ "Your todos: [list from protected API]\nBilling: [billing information]"
```

### Web Search & Research

```text
User: "Research the latest developments in AI agents"
Claude: [Uses Tavily MCP server]
→ [Searches web in real-time] 
→ "Here are the latest developments in AI agents based on current sources..."
```

### Multi-Agent Coordination

```text
User: "Analyze this code and create tests"
Claude: [Uses multiple MCP servers]
→ [Code analysis agent] + [Test generation agent] 
→ "Code analysis complete. Tests generated: [test files]"
```

### Combined Usage

```text
User: "Plan an outdoor meeting for tomorrow considering weather"
Claude: [Uses weather, documentation, and search servers]
→ "Based on tomorrow's forecast (sunny, 75°F) and best practices from documentation..."
```

## 🎯 Development Workflow

### Local Development

```bash
# Start weather server
cd 02-weather-server-python
python weather.py

# Start documentation server
cd 03-mcpdoc
uvx --from mcpdoc mcpdoc --urls "LangGraph:https://..."

# Start Auth0 MCP server
cd 09-remote-mcp-auth0/mcp-auth0-oidc
npm run dev

# Start context engineering server
cd 10-context-engineering-mcp
fastmcp dev verbose_mcp_server.py
```

### Testing with MCP Inspector

```bash
# Test weather server
npx @modelcontextprotocol/inspector
# Connect to: stdio://python weather.py

# Test Auth0 server
npx @modelcontextprotocol/inspector
# Connect to: https://mcp-auth0-oidc.todos-api-danielgeek.workers.dev/sse

# Test context server
npx @modelcontextprotocol/inspector
# Connect to: stdio://fastmcp dev verbose_mcp_server.py
```

### IDE Integration

- Configure your preferred IDE (Claude, Windsurf, Cursor, Claude Code)
- Test MCP tools are working
- Start development with enhanced AI assistance
- Use project-specific MCP configs for optimal performance

### Production Deployment

```bash
# Deploy Auth0 MCP server to Cloudflare Workers
cd 09-remote-mcp-auth0/mcp-auth0-oidc
npm run build
npm run deploy

# Deploy context engineering server
fastmcp deploy --platform cloudflare

# Monitor production logs
curl https://mcp-auth0-oidc.todos-api-danielgeek.workers.dev/logs
```

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

### Shell Server Tools

- `execute_command`: Execute shell commands safely
- `list_files`: List directory contents
- `read_file`: Read file contents

### Auth0 MCP Server Tools

- `whoami`: Get current user details from Auth0
- `list-todos`: List user's todos from protected API
- `list-billing`: Get billing information (scope-based access)

### Context Engineering Tools

- `optimize_context`: Optimize token usage
- `analyze_performance`: Analyze context efficiency
- `manage_tokens`: Token management utilities

### Agent Skills Tools

- `coordinate_agents`: Coordinate multiple agents
- `execute_skill`: Execute specialized agent skill
- `monitor_performance`: Monitor agent performance

### Tavily Search Tools

- `web_search`: Search the web in real-time
- `get_news`: Fetch recent news
- `research_topic`: Deep research on topics

### Playwright Tools

- `automate_browser`: Browser automation
- `take_screenshot`: Capture screenshots
- `extract_data`: Web data extraction

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

# Shell Server
cd 04-shellserver
python server.py

# LangChain Adapters
cd 06-langchain-mcp-adapters
python main.py

# Auth0 MCP Server
cd 09-remote-mcp-auth0/mcp-auth0-oidc
npm run build
npm run deploy

# Context Engineering
cd 10-context-engineering-mcp
fastmcp dev verbose_mcp_server.py

# Agent Skills
cd 11-agent-skills
npm run dev

# MCP Inspector Testing
npx @modelcontextprotocol/inspector
# Connect to any MCP server endpoint
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
- [Auth0 Documentation](https://auth0.com/docs)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Tavily Search API](https://tavily.com/)
- [Playwright Automation](https://playwright.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [LangChain Documentation](https://python.langchain.com/docs/)
- [OAuth 2.0 and PKCE](https://oauth.net/2/pkce/)
- [JWT Token Management](https://jwt.io/)
- [Context Window Optimization](https://docs.anthropic.com/claude/docs/context-window)
- [Multi-Agent Systems](https://langchain-ai.github.io/langgraph/concepts/multi_agent/)

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

**Version:** 2.0.0

**Maintainer:** Daniel Ángel - MCP Development Community

## 🔗 Quick Links

- [MCP Reference Guide](./MCP_REFERENCE.md) - Comprehensive MCP documentation
- [Commands Reference](./COMMANDS.md) - MCP commands and utilities
- [Weather Server (Python)](./02-weather-server-python/) - Python weather implementation
- [Weather Server (TypeScript)](./01-weather-server-typescript/) - TypeScript weather implementation
- [Documentation Server](./03-mcpdoc/) - MCPDoc for technical documentation
- [Shell Server](./04-shellserver/) - Secure shell command execution
- [LangChain Adapters](./06-langchain-mcp-adapters/) - LangChain MCP integration
- [Auth0 MCP Server](./09-remote-mcp-auth0/) - Production OAuth authentication
- [Context Engineering](./10-context-engineering-mcp/) - Token optimization
- [Agent Skills](./11-agent-skills/) - Multi-agent coordination

## 🚀 Production Deployments

### Auth0 MCP Server

- **URL**: <https://mcp-auth0-oidc.todos-api-danielgeek.workers.dev>
- **Status**: ✅ Production Ready
- **Features**: OAuth 2.0, JWT tokens, Remote access

### Todos API

- **URL**: <https://api.todos-api-danielgeek.workers.dev>
- **Status**: ✅ Production Ready
- **Features**: Protected endpoints, Scope-based access

### Context Engineering

- **Status**: ✅ Development Complete
- **Features**: Token optimization, Performance monitoring

### Agent Skills

- **Status**: ✅ Development Complete
- **Features**: Multi-agent coordination, Next.js frontend
