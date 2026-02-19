# 36-AutoGen-Agent-Chat

A multi-agent airline assistant system built with Microsoft AutoGen framework, featuring tool integration and database connectivity.

## 🎯 Overview

This project demonstrates the capabilities of AutoGen's agent chat system by creating an intelligent airline assistant that can:

- Handle customer inquiries with humor
- Access pricing data from SQLite database
- Use tools to provide real-time information
- Support both OpenAI and Ollama model clients

## 🏗️ Architecture

### Components

1. **Basic Agent** - Simple airline assistant with humorous responses
2. **Smart Agent** - Enhanced assistant with database tool integration
3. **SQLite Database** - Stores city pricing information
4. **Tool System** - Custom function for price lookup

### Key Features

- ✅ **Multi-Agent System**: Two specialized agents with different capabilities
- ✅ **Tool Integration**: Custom database lookup tools
- ✅ **Database Connectivity**: SQLite for persistent data storage
- ✅ **Multiple Model Support**: OpenAI and Ollama clients
- ✅ **Streaming Support**: Real-time response streaming
- ✅ **Cancellation Support**: Async operation cancellation

## 📦 Installation

### Prerequisites

- Python 3.14+
- uv package manager
- OpenAI API key (for OpenAI client)
- Ollama server (optional, for local models)

### Setup

1. **Clone and navigate to project:**

```bash
cd 36-autogen_agent_chat
```

2. **Install dependencies:**

```bash
uv sync
```

3. **Configure environment variables:**

```bash
# Create .env file
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
```

4. **(Optional) Setup Ollama:**

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Download model
ollama pull llama3.2

# Start Ollama server
ollama serve
```

## 🚀 Usage

### Running the Application

```bash
uv run main.py
```

### Expected Output

```text
id='df91f741-ef78-4ff4-9857-a3168a936477' source='user' models_usage=None metadata={} created_at=datetime.datetime(2026, 2, 19, 4, 37, 27, 772408, tzinfo=datetime.timezone.utc) content="I'd like to go to London" type='TextMessage'
Sure! Just be sure to pack your umbrella—it rains there more than it does in a wet sponge factory! 🇬🇧☔️
The price for a round trip to Rome is 499.0
[FunctionCall(id='call_WzrArgxwhjXcox4UdLmU92el', arguments='{"city_name":"London"}', name='get_city_price')]
[FunctionExecutionResult(content='299.0', name='get_city_price', call_id='call_WzrArgxwhjXcox4UdLmU92el', is_error=False)]
Sure! A roundtrip ticket to London is just $299. Pack your umbrella—it's always raining or suspending!
```

## 🔧 Configuration

### Model Clients

The project supports two model clients:

1. **OpenAI Client** (default):

```python
model_client = OpenAIChatCompletionClient(model="gpt-4o-mini")
```

2. **Ollama Client** (local):

```python
ollamamodel_client = OllamaChatCompletionClient(model="llama3.2")
```

### Database

The application uses SQLite with the following structure:

```sql
CREATE TABLE cities (
    city_name TEXT PRIMARY KEY, 
    round_trip_price REAL
);
```

Sample data included:

- London: $299
- Paris: $399
- Rome: $499
- Madrid: $550
- Barcelona: $580
- Berlin: $525

## 🛠️ Development

### Project Structure

```
36-autogen_agent_chat/
├── main.py              # Main application with agents and tools
├── pyproject.toml       # Project dependencies
├── .env.example         # Environment variables template
├── tickets.db          # SQLite database (created on run)
└── README.md           # This file
```

### Key Components

#### AssistantAgent

```python
agent = AssistantAgent(
    name="airline_agent",
    model_client=model_client,
    system_message="You are a helpful assistant for an airline. You give short, humorous answers.",
    model_client_stream=True
)
```

#### Tool Integration

```python
smart_agent = AssistantAgent(
    name="smart_airline_agent",
    model_client=model_client,
    system_message="You are a helpful assistant for an airline...",
    model_client_stream=True,
    tools=[get_city_price],
    reflect_on_tool_use=True
)
```

#### Database Functions

- `init_database()` - Initialize/clear database
- `save_city_price()` - Store city pricing
- `get_city_price()` - Retrieve pricing (tool function)

## 🔍 How It Works

1. **Initialization**: Sets up agents and database
2. **Basic Query**: First agent provides humorous response
3. **Database Setup**: Populates pricing data
4. **Smart Query**: Second agent uses tool to provide pricing
5. **Tool Execution**: Shows function calls and results

## 📚 Dependencies

```toml
dependencies = [
    "autogen-ext>=0.7.5",        # AutoGen extensions
    "autogen-agentchat>=0.0.1",  # Agent chat framework
    "openai>=1.0.0",             # OpenAI client
    "python-dotenv>=1.2.1",      # Environment variables
    "tiktoken>=0.5.0",           # Tokenization
    "ollama>=0.1.0",             # Ollama client
]
```

## 🎓 Learning Resources

- [Microsoft AutoGen Documentation](https://microsoft.github.io/autogen/)
- [AutoGen Agent Chat](https://microsoft.github.io/autogen/docs/topics/agentchat/)
- [OpenAI API](https://platform.openai.com/docs)
- [Ollama Documentation](https://ollama.ai/documentation)

## 🚀 Extensions

### Possible Enhancements

1. **More Tools**: Add booking, cancellation, or flight status tools
2. **Multi-Agent Workflows**: Create specialized agents for different tasks
3. **Real-time Data**: Connect to live airline APIs
4. **UI Integration**: Add web interface with Gradio or Streamlit
5. **Persistence**: Store conversation history
6. **Error Handling**: Add comprehensive error management

### Adding New Tools

```python
def check_flight_status(flight_number: str) -> str:
    """Check the status of a flight"""
    # Implementation here
    return "On Time"

# Add to agent
agent_with_tools = AssistantAgent(
    name="flight_agent",
    model_client=model_client,
    tools=[get_city_price, check_flight_status],
    reflect_on_tool_use=True
)
```

## 🐛 Troubleshooting

### Common Issues

1. **Missing API Key**:
   - Ensure `OPENAI_API_KEY` is set in `.env`
   - Verify the key is valid and has credits

2. **Ollama Connection Error**:
   - Make sure Ollama server is running: `ollama serve`
   - Check model is downloaded: `ollama list`

3. **Database Errors**:
   - Ensure write permissions in project directory
   - Database is recreated automatically on each run

4. **Import Errors**:
   - Run `uv sync` to ensure all dependencies are installed
   - Check Python version is 3.14+

## 📄 License

This project is for educational purposes to demonstrate AutoGen capabilities.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Note**: This is an educational project demonstrating Microsoft AutoGen's agent chat system with tool integration and database connectivity.
