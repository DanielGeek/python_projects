# 45 - MCP OpenAI Multi-Tool Agent System

## 📋 Description

This project demonstrates a sophisticated **AI agent system** that integrates multiple Model Context Protocol (MCP) servers to create a powerful web investigation and content creation assistant. The system combines web browsing, file system operations, and content generation capabilities using OpenAI's agent framework with MCP integration.

## 🏗️ Architecture

### **Core Components:**

- **Agent Framework**: OpenAI Agents with MCP server integration
- **MCP Servers**: Multiple specialized servers for different capabilities
- **Web Browser**: Playwright-based web automation and scraping
- **File System**: Secure sandboxed file operations
- **Fetch Tool**: HTTP requests and web content retrieval

### **Key Features:**

- ✅ **Multi-Server Integration**: Combines multiple MCP servers seamlessly
- ✅ **Web Browsing**: Advanced web navigation with Playwright
- ✅ **File Operations**: Secure sandboxed file system access
- ✅ **Content Generation**: AI-powered content creation and summarization
- ✅ **Task Automation**: End-to-end automated investigation workflows

## 🚀 Features

### **Agent Capabilities:**

- **Internet Browsing**: Navigate websites, accept cookies, handle popups
- **Content Extraction**: Extract and process web content intelligently
- **File Management**: Create, read, and write files in sandboxed environment
- **Research Tasks**: Perform comprehensive online investigations
- **Content Summarization**: Generate markdown summaries of findings

### **Technical Capabilities:**

- **MCP Protocol**: Model Context Protocol for tool integration
- **Async Operations**: Fully asynchronous agent execution
- **Session Management**: Configurable timeout and session handling
- **Error Handling**: Robust error handling for network operations
- **Trace Logging**: Comprehensive execution tracing

## 🛠️ Installation

### **Prerequisites:**
- Python 3.14+
- uv package manager
- OpenAI API key
- Node.js (for Playwright MCP server)

### **Installation Steps:**

```bash
# Clone the project
cd /Users/thepunisher/Documents/GitHub/python_projects/45-MCP_OpenAI

# Install dependencies
uv sync

# Configure environment variables
cp .env.example .env
# Edit .env with your OpenAI API key

# Create sandbox directory
mkdir -p sandbox
```

### **Environment Variables (.env):**

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## 🎮 Usage

### **System Execution:**

```bash
# Run the investigation agent
uv run main.py
```

### **What Happens:**

1. **MCP Server Initialization**: Three MCP servers are started (fetch, playwright, filesystem)
2. **Agent Creation**: Investigator agent is created with integrated tools
3. **Task Execution**: Agent searches for Banoffee Pie recipe online
4. **Content Processing**: Recipe is extracted and summarized
5. **File Output**: Results are saved to `sandbox/banoffee.md`

### **Customization Example:**

```python
# Modify the task in main.py
result = await Runner.run(agent, "Find the latest AI trends and summarize them in trends.md")
```

## 🔧 Configuration

### **MCP Server Configuration:**

```python
# Web Fetch Server
fetch_params = {"command": "uvx", "args": ["mcp-server-fetch"]}

# Browser Automation Server
playwright_params = {"command": "npx", "args": ["@playwright/mcp@latest"]}

# File System Server
files_params = {"command": "npx", "args": ["-y", "@modelcontextprotocol/server-filesystem", sandbox_path]}
```

### **Agent Instructions:**

The agent is configured with specific instructions for:

- **Web Navigation**: Handling cookies, popups, and site navigation
- **Persistence**: Trying multiple sources and approaches
- **File Operations**: Writing outputs only to the sandbox folder
- **Task Completion**: Ensuring thorough investigation

## 🎓 Key Concepts

### **Model Context Protocol (MCP):**

- **Standardized Interface**: Common protocol for AI tool integration
- **Server Architecture**: Modular server-based tool organization
- **Async Communication**: Non-blocking tool execution
- **Session Management**: Configurable timeouts and connection handling

### **Agent Workflow:**

1. **Tool Discovery**: Agent discovers available tools from MCP servers
2. **Task Planning**: Breaks down complex tasks into tool operations
3. **Execution**: Uses tools sequentially or in parallel
4. **Integration**: Combines results from multiple tools
5. **Output Generation**: Creates structured output files

## 📈 Metrics

- **Server Count**: 3 integrated MCP servers
- **Response Time**: ~10-30 seconds for complex web investigations
- **API Usage**: Varies by task complexity (web browsing + content generation)
- **Tool Integration**: 6+ specialized tools across all servers
- **File Operations**: Secure sandboxed file system access

## 🔄 Workflow

1. **Environment Setup**: Load environment variables and configure paths
2. **Server Initialization**: Start and configure MCP servers
3. **Tool Discovery**: Enumerate available tools from each server
4. **Agent Creation**: Create agent with integrated tool access
5. **Task Execution**: Run investigation task with tracing
6. **Result Processing**: Format and save results to sandbox
7. **Cleanup**: Proper server shutdown and resource cleanup

## 🌐 MCP Servers Used

### **1. MCP Server Fetch**

- **Purpose**: HTTP requests and web content retrieval
- **Capabilities**: GET, POST requests, header management
- **Use Case**: Simple web content fetching

### **2. Playwright MCP Server**

- **Purpose**: Advanced browser automation
- **Capabilities**: Page navigation, element interaction, screenshots
- **Use Case**: Complex web interactions and dynamic content

### **3. Filesystem MCP Server**

- **Purpose**: Secure file system operations
- **Capabilities**: Read, write, list files in sandbox
- **Use Case**: Output generation and file management

## 🤝 Contributions

### **Extension Ideas:**

1. **Additional MCP Servers**: Add more specialized servers
2. **Custom Tools**: Create domain-specific investigation tools
3. **Multi-Agent Systems**: Coordinate multiple specialized agents
4. **Web Interface**: Build a dashboard for agent monitoring
5. **Result Analytics**: Add analysis and visualization of results

### **Customization:**

- Modify agent instructions for different domains
- Add new MCP servers for specialized capabilities
- Configure different output formats and locations
- Implement custom error handling and retry logic

## 📦 Dependencies

- **openai>=1.0.0**: OpenAI API client and agent framework
- **openai-agents>=0.10.1**: OpenAI agents library with MCP support
- **python-dotenv>=1.2.1**: Environment variable management
- **mcp-server-fetch**: MCP server for HTTP requests
- **@playwright/mcp**: MCP server for browser automation
- **@modelcontextprotocol/server-filesystem**: MCP server for file operations

## 🐛 Troubleshooting

### **Common Issues:**

1. **MCP Server Connection**: Ensure Node.js is installed for Playwright server
2. **API Key Issues**: Verify OpenAI API key is correctly set
3. **Sandbox Permissions**: Ensure write access to sandbox folder
4. **Network Issues**: Check internet connectivity for web browsing
5. **Timeout Errors**: Increase timeout values for complex tasks

### **Debug Tips:**

- Enable trace logging to see detailed execution steps
- Check sandbox folder for generated output files
- Verify MCP servers are running before agent execution
- Use simpler tasks for initial testing

## 📄 License

This project is for educational and demonstration purposes, showcasing advanced AI agent integration with Model Context Protocol.

---

**MCP OpenAI Multi-Tool Agent System** - Advanced AI investigation with multi-server integration