# 39 - AutoGen RoundRobin Agent Chat with LangChain Integration

## 📋 Overview

This project demonstrates a multi-agent conversation system using Microsoft AutoGen's `RoundRobinGroupChat` with LangChain tool integration. The system features a primary agent that searches for flight information and an evaluator agent that provides feedback and approval.

## 🎯 Key Features

- **Multi-Agent RoundRobin Conversation**: Alternating turns between primary and evaluator agents
- **LangChain Tool Integration**: Google Serper API for internet search capabilities
- **Iterative Feedback Loop**: Evaluator provides constructive feedback until response is approved
- **TextMentionTermination**: Automatic termination when evaluator responds with "APPROVE"
- **GPT-4o-mini Integration**: OpenAI model for intelligent agent responses

## 🏗️ Architecture

### FlightResearchSystem Class

The system is built around a main `FlightResearchSystem` class that encapsulates all functionality:

```python
class FlightResearchSystem:
    """A system that manages agents to research flight deals using Serper and OpenAI."""
    
    def __init__(self, model_name: str = "gpt-4o-mini", max_turns: int = 20):
        pass
    def _validate_environment(self) -> None:
        pass
    def _setup_team(self) -> RoundRobinGroupChat:
        pass
    async def run(self, task_prompt: str) -> None:
        pass
```

### Core Components

1. **Environment Validation**: 
   - Validates required environment variables (`OPENAI_API_KEY`, `SERPER_API_KEY`)
   - Provides clear error messages for missing configuration

2. **Logging System**:
   - Structured logging with timestamps and severity levels
   - Error tracking and debugging information
   - Console output for real-time monitoring

3. **Agent Configuration**:
   - **Primary Agent**: Searches for flight information using internet search
   - **Evaluator Agent**: Provides constructive feedback and approval
   - **RoundRobin Team**: Manages turn-based conversation flow

4. **Error Handling**:
   - Try-catch blocks for search operations
   - Graceful error recovery and user feedback
   - System-level exception handling

### Workflow

```

Environment Validation → Team Setup → User Request 
→ Primary Agent (Search) → Primary Agent (Response) 
→ Evaluator Agent (Feedback) → Primary Agent (Refine) 
→ Evaluator Agent (Approve) → TERMINATION
```

### Key Features

- **Robust Error Handling**: Comprehensive exception management
- **Environment Validation**: Ensures proper configuration before execution
- **Structured Logging**: Professional logging with different severity levels
- **Modular Design**: Clean separation of concerns with dedicated methods
- **Concurrent Search**: Multiple search queries for comprehensive results

## 🚀 Getting Started

### Prerequisites

- Python 3.14+
- OpenAI API key
- Google Serper API key
- UV package manager

### Installation


1. Clone the repository:

```bash
git clone <repository-url>
cd 39-autogen_agent_chat_roundrobin
```

2. Install dependencies:
```bash
uv sync
```

3. Set up environment variables:
```bash
# Create .env file
OPENAI_API_KEY=your_openai_api_key
SERPER_API_KEY=your_serper_api_key
```

### Running the Project

```bash
uv run main.py
```

## 📊 Example Output

```

2026-02-21 01:55:13,928 - autogen_core.events - INFO - {"payload": "{\"message\":{\"id\":\"3c074160-c585-45c1-986d-cdc3a4d2178c\",\"source\":\"evaluator\",\"models_usage\":{\"prompt_tokens\":793,\"completion_tokens\":3},\"metadata\":{},\"created_at\":\"2026-02-21T05:55:13.927573Z\",\"content\":\"APPROVE\",\"type\":\"TextMessage\"}}", "sender": "evaluator_a18d4c8d-128e-4322-93a7-396a00ba019e/a18d4c8d-128e-4322-93a7-396a00ba019e", "receiver": null, "kind": "MessageKind.PUBLISH", "delivery_stage": "DeliveryStage.DELIVER", "type": "Message"}

2026-02-21 01:55:13,930 - autogen_core - INFO - Publishing message of type GroupChatTermination to all subscribers: {'message': StopMessage(id='399c4c73-687c-44b3-b3b5-e50fed1a1c52', source='TextMentionTermination', models_usage=None, metadata={}, created_at=datetime.datetime(2026, 2, 21, 5, 55, 13, 930200, tzinfo=datetime.timezone.utc), content="Text 'APPROVE' mentioned", type='StopMessage'), 'error': None}

2026-02-21 01:55:13,931 - __main__ - INFO - Task completed. Printing results:

==================================================

[USER]:
Find a one-way non-stop flight from JFK to LHR in June 2026.

IMPORTANT: When you provide your answer, you MUST:
1. Focus ONLY on non-stop flights for June 2026
2. Organize the information in a clear, structured format with bullet points
...

[PRIMARY]:
[FunctionCall(id='call_Bkhvmo1nH7tfYtdFFg2bJto7', arguments='{"query":"One-way non-stop flight from JFK to LHR June 2026 prices"}', name='internet_search')]

[PRIMARY]:
[FunctionExecutionResult(content="Cheap Flights from New York (JFK) to London (LHR) start at $205 for one-way and $377 for round trip...")]

[PRIMARY]:
Cheap Flights from New York (JFK) to London (LHR) start at $205 for one-way and $377 for round trip...

[EVALUATOR]:
**Non-Stop Flights from JFK to LHR in June 2026:**
- **British Airways**: Starting at $518 (typical range: $500 - $760)
- **United Airlines**: Starting at $516 (typical range: $500 - $760)
- **Flight Duration**: Approximately 7-8 hours

Please ensure that the flight details, including prices, are up to date at the time of booking.

[PRIMARY]:
**Non-Stop Flights from JFK to LHR in June 2026:**
- **British Airways**: Starting at $518 (typical range: $500 - $760)
- **United Airlines**: Starting at $516 (typical range: $500 - $760)
- **Flight Duration**: Approximately 7-8 hours

Please ensure to check the details and pricing when you're ready to book, as they are subject to change.

[EVALUATOR]:
APPROVE

==================================================
```

### Agent Configuration

- **Model**: `gpt-4o-mini`
- **Max Turns**: 20
- **Termination Condition**: `TextMentionTermination("APPROVE")`

### Tool Integration

- **Search Tool**: Google Serper API via LangChain
- **Adapter**: `LangChainToolAdapter` for AutoGen compatibility

## 🎓 Key Learnings

1. **Prompt vs System Message**: Instructions in user prompt are more effective than system message when using tools
2. **Iterative Improvement**: Multi-turn conversations with feedback produce better results
3. **Termination Conditions**: `TextMentionTermination` works reliably for approval-based workflows
4. **Tool Integration**: LangChain tools can be seamlessly integrated with AutoGen agents
5. **Class-Based Architecture**: Encapsulating functionality in classes improves code organization and reusability
6. **Environment Validation**: Validating configuration early prevents runtime errors and improves user experience
7. **Structured Logging**: Professional logging with different severity levels aids debugging and monitoring
8. **Error Handling**: Comprehensive exception management makes the system more robust and user-friendly

## 🐛 Troubleshooting

### Common Issues

1. **Missing Environment Variables**: The system validates `OPENAI_API_KEY` and `SERPER_API_KEY` on startup
2. **Agent not following instructions**: Put detailed instructions in the user prompt rather than system message
3. **Conversation stopping early**: Ensure termination condition is properly configured
4. **Search tool errors**: Check internet connectivity and Serper API quota
5. **Logging not showing**: Ensure logging level is set to INFO in the configuration

### Environment Validation

The system automatically validates required environment variables:

```python
# Missing variables will cause:
EnvironmentError: Missing required environment variables: OPENAI_API_KEY, SERPER_API_KEY
```

### Debug Mode

The system includes comprehensive logging by default:

```python
# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
```

**Log Levels:**
- `INFO`: Normal operation flow
- `ERROR`: Search failures and system errors  
- `CRITICAL`: Application startup failures

### Error Recovery

The system includes built-in error handling:

```python
try:
    return serper.run(query)
except Exception as e:
    logger.error(f"Error during internet search: {e}", exc_info=True)
    return f"Error executing search: {str(e)}"
```

## 🔗 Dependencies

- `autogen-agentchat`: Multi-agent framework
- `autogen-ext.models.openai`: OpenAI model integration
- `autogen-ext.tools.langchain`: LangChain tool adapter
- `langchain-community`: Community tools (Google Serper)
- `langchain-core`: Core LangChain functionality
- `python-dotenv`: Environment variable management

## 📝 Notes

- The system demonstrates effective human-AI collaboration patterns with robust error handling
- Class-based architecture provides better code organization and reusability
- Environment validation ensures proper configuration before execution
- Structured logging provides comprehensive debugging and monitoring capabilities
- RoundRobin conversation ensures structured dialogue with built-in error recovery
- Feedback loops improve response quality iteratively with graceful error handling
- Text-based termination provides clear approval workflows with logging confirmation

## 🚀 Future Enhancements

1. Add more sophisticated evaluation criteria with configurable rubrics
2. Implement multiple search tools for better information gathering with fallback mechanisms
3. Add memory capabilities for context retention across conversations using vector stores
4. Implement concurrent tool usage for faster information gathering with async execution
5. Add configuration file support for different search scenarios and agent personalities
6. Implement metrics collection and performance monitoring for system optimization
7. Add support for multiple LLM providers with automatic failover capabilities
