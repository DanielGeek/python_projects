# 38-AutoGen-Agent-Chat-with-LangChain

A sophisticated multi-agent system that combines Microsoft AutoGen with LangChain tools to create an intelligent flight search assistant with file management capabilities.

## 🎯 Overview

This project demonstrates the powerful integration of AutoGen agents with LangChain's extensive tool ecosystem by creating an intelligent flight search assistant that can:

- Search the internet for flight deals using Google Serper API
- Manage files with read/write operations in a sandbox environment
- Execute multi-step workflows with tool reflection
- Generate structured markdown reports with flight information
- Provide intelligent recommendations based on search results

## 🏗️ Architecture

### Components

1. **AutoGen Agent** - Core AI agent with tool integration capabilities
2. **LangChain Tools** - Internet search and file management utilities
3. **Tool Adapter** - LangChainToolAdapter for seamless integration
4. **Sandbox Environment** - Isolated file system for safe operations

### Key Features

- ✅ **Internet Search**: Google Serper API integration for real-time flight search
- ✅ **File Management**: Complete file operations (read, write, copy, delete, move)
- ✅ **Tool Reflection**: Agent reflects on tool usage for better decision making
- ✅ **Multi-Step Workflows**: Complex task decomposition and execution
- ✅ **Markdown Generation**: Automatic report creation with structured data
- ✅ **Sandbox Safety**: Isolated file operations in dedicated directory

## 📦 Installation

### Prerequisites

- Python 3.14+
- uv package manager
- OpenAI API key
- Google Serper API key

### Setup

1. **Clone and navigate to project:**

```bash
cd 38-autogen_agent_chat_with_langchain
```

1. **Install dependencies:**

```bash
uv sync
```

1. **Configure environment variables:**

```bash
# Create .env file
cat > .env << EOF
OPENAI_API_KEY=your_openai_api_key_here
SERPER_API_KEY=your_google_serper_api_key_here
EOF
```

## 🚀 Usage

### Running the Application

```bash
uv run main.py
```

### Expected Output

```text
toolFileManagement internet_search Useful for when you need to search the internet.
toolFileManagement copy_file Create a copy of a file in a specified location
toolFileManagement file_delete Delete a file
toolFileManagement file_search Recursively search for files in a subdirectory that match the regex pattern
toolFileManagement move_file Move or rename a file from one location to another
toolFileManagement read_file Read file from disk
toolFileManagement write_file Write file to disk
toolFileManagement list_directory List files and directories in a specified folder

[FunctionCall(id='call_RRKvU7Rs1DwyTxA2STYnFmob', arguments='{"query":"one-way non-stop flight deals from JFK to LHR in June 2026"}', name='internet_search')]
[FunctionExecutionResult(content="...", name='internet_search', call_id='call_RRKvU7Rs1DwyTxA2STYnFmob', is_error=False)]

==================================================
📝 RESULT:
==================================================
I have gathered some promising details for one-way non-stop flights from JFK to LHR in June 2026. Now, I will write the information to a file called flights.md.

[FunctionCall(id='call_IYW4ISlmwPpSumN0a3fMUbm4', arguments='{"file_path":"flights.md","text":"# Flights from JFK to LHR in June 2026\\n\\n..."}', name='write_file')]
[FunctionExecutionResult(content='File written successfully to flights.md.', name='write_file', call_id='call_IYW4ISlmwPpSumN0a3fMUbm4', is_error=False)]

==================================================
📝 RESULT:
==================================================
**Selected Flight:**
- **Airline:** American Airlines
- **Price:** $205
- **Departure:** June 1, 2026
- **Arrival:** June 1, 2026
- **Duration:** 7 hours
- **Non-stop:** Yes

This flight offers the best price at $205 for a one-way non-stop journey from JFK to LHR. Safe travels!
```

## 🔧 Configuration

### Tool Integration

The project uses LangChainToolAdapter to bridge LangChain tools with AutoGen:

```python
from autogen_ext.tools.langchain import LangChainToolAdapter
from langchain_core.tools import tool

# Custom tool with @tool decorator
@tool
def internet_search(query: str) -> str:
    """Useful for when you need to search the internet."""
    return serper.run(query)

# Convert LangChain tool to AutoGen
autogen_serper = LangChainToolAdapter(internet_search)
```

### Agent Configuration

```python
agent = AssistantAgent(
    name="searcher",
    model_client=model_client,
    tools=autogen_tools,
    reflect_on_tool_use=True  # Enables tool reflection
)
```

### Available Tools

1. **internet_search** - Google Serper API for web search
2. **copy_file** - Create file copies
3. **file_delete** - Delete files
4. **file_search** - Recursive file search with regex
5. **move_file** - Move/rename files
6. **read_file** - Read file contents
7. **write_file** - Write files to disk
8. **list_directory** - List directory contents

## 🛠️ Development

### Project Structure

```
38-autogen_agent_chat_with_langchain/
├── main.py              # Agent implementation with tool integration
├── pyproject.toml       # Project dependencies
├── .env.example         # Environment variables template
├── sandbox/             # File operations directory (created automatically)
├── flights.md          # Generated flight report (created by agent)
└── README.md           # This file
```

### Key Components

#### Multi-Step Workflow

```python
prompt = """Your task is to find a one-way non-stop flight from JFK to LHR in June 2026.
First search online for promising deals.
Next, write all the deals to a file called flights.md with full details.
Finally, select the one you think is best and reply with a short summary.
Reply with the selected flight only, and only after you have written the details to the file."""
```

#### Tool Registration

```python
# Internet search tool
autogen_tools = [autogen_serper]

# File management tools
langchain_file_management_tools = FileManagementToolkit(root_dir="sandbox").get_tools()
for toolFileManagement in langchain_file_management_tools:
    autogen_tools.append(LangChainToolAdapter(toolFileManagement))
```

#### Sequential Processing

```python
async def main():
    # First task: Search and analyze flights
    message = TextMessage(content=prompt, source="user")
    result = await agent.on_messages([message], cancellation_token=CancellationToken())
    
    # Second task: Follow-up processing
    message = TextMessage(content="OK proceed", source="user")
    result = await agent.on_messages([message], cancellation_token=CancellationToken())
```

## 🔍 How It Works

1. **Tool Registration**: LangChain tools are converted to AutoGen-compatible format
2. **Agent Initialization**: Agent is configured with tool access and reflection enabled
3. **Task Decomposition**: Complex prompt is broken into searchable components
4. **Internet Search**: Google Serper API finds current flight deals
5. **File Operations**: Results are written to markdown file in sandbox
6. **Analysis**: Agent analyzes and selects best option
7. **Reporting**: Final recommendation is provided with justification

## 📚 Dependencies

```toml
dependencies = [
    "autogen-ext>=0.7.5",              # AutoGen extensions
    "autogen-agentchat>=0.0.1",        # Agent chat framework
    "openai>=1.0.0",                   # OpenAI client
    "python-dotenv>=1.2.1",            # Environment variables
    "tiktoken>=0.5.0",                 # Tokenization
    "ipython>=9.10.0",                 # Display utilities
    "langchain-google-community>=3.0.5", # Google Serper integration
    "langchain>=1.2.10",               # LangChain framework
]
```

## 🎓 Learning Resources

- [Microsoft AutoGen Documentation](https://microsoft.github.io/autogen/)
- [AutoGen Tool Integration](https://microsoft.github.io/autogen/docs/topics/tool-use/)
- [LangChain Documentation](https://python.langchain.com/docs/)
- [Google Serper API](https://serper.dev/)
- [LangChain Tools](https://python.langchain.com/docs/modules/tools/)

## 🚀 Extensions

### Possible Enhancements

1. **Additional Search APIs**: Bing Search, DuckDuckGo, or custom APIs
2. **Flight APIs**: Direct integration with airline APIs or Amadeus
3. **Data Visualization**: Generate charts and graphs for price trends
4. **Email Notifications**: Send results via email using SMTP
5. **Database Storage**: Store search results in SQLite or PostgreSQL
6. **Web Interface**: Add Gradio or Streamlit frontend
7. **Scheduled Searches**: Automated periodic searches for price monitoring

### Adding Custom Tools

```python
@tool
def flight_price_tracker(route: str, price_threshold: float) -> str:
    """Track flight prices and alert when they drop below threshold."""
    # Implementation here
    return f"Price alert for {route}: Current price ${price}"

# Register the tool
custom_tool = LangChainToolAdapter(flight_price_tracker)
autogen_tools.append(custom_tool)
```

### Advanced File Operations

```python
@tool
def analyze_flight_data(file_path: str) -> str:
    """Analyze flight data from CSV or JSON files."""
    # Implementation with pandas or json
    return "Analysis complete: Best deals found on Tuesdays and Wednesdays"
```

## 🐛 Troubleshooting

### Common Issues

1. **API Key Errors**:
   - Ensure both OPENAI_API_KEY and SERPER_API_KEY are set in .env
   - Verify Serper API key is active and has credits

2. **File Permission Errors**:
   - Ensure write permissions in project directory
   - Check that sandbox directory can be created

3. **Tool Execution Failures**:
   - Verify internet connectivity for search operations
   - Check file paths are valid and within sandbox

4. **Import Errors**:
   - Run `uv sync` to ensure all dependencies are installed
   - Check Python version is 3.14+

### Debug Mode

```python
# Enable verbose logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Print tool details
for tool in autogen_tools:
    print(f"Tool: {tool.name}, Description: {tool.description}")
```

### Environment Setup

```bash
# Verify API keys
echo $OPENAI_API_KEY
echo $SERPER_API_KEY

# Test Serper API
curl -H "X-API-KEY: $SERPER_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"q": "test query"}' \
     https://google.serper.dev/search
```

## 📄 License

This project is for educational purposes to demonstrate AutoGen and LangChain integration.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Note**: This is an educational project demonstrating the powerful integration between Microsoft AutoGen and LangChain tools for building sophisticated multi-agent systems.