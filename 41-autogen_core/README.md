# 41-autogen_core - AutoGen Core Framework Fundamentals

**Category**: Multi-Agent Systems | **Frameworks**: Microsoft AutoGen Core | **Language**: Python 3.14+

A comprehensive demonstration of Microsoft AutoGen Core framework fundamentals, showcasing custom agent creation, message routing, runtime management, and LLM integration patterns.

## 🎯 Key Features

- **🤖 Custom Agent Development**: Build custom agents using RoutedAgent base class
- **📨 Message Handling**: Implement custom message types and handlers
- **🔄 Runtime Management**: Single-threaded agent runtime with lifecycle management
- **🧠 LLM Integration**: OpenAI model integration through AssistantAgent delegation
- **🔀 Agent Communication**: Inter-agent messaging with typed message protocols
- **⚡ Asynchronous Processing**: Full async/await support for concurrent operations

## 🏗️ Architecture

### Custom Agent Implementation

The system demonstrates two types of custom agents:

```python
from dataclasses import dataclass
from autogen_core import AgentId, MessageContext, RoutedAgent, message_handler
from autogen_core import SingleThreadedAgentRuntime
from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.openai import OpenAIChatCompletionClient

@dataclass
class Message:
    content: str

class SimpleAgent(RoutedAgent):
    def __init__(self) -> None:
        super().__init__("Simple")

    @message_handler
    async def on_my_message(self, message: Message, ctx: MessageContext) -> Message:
        return Message(
            content=f"This is {self.id.type}-{self.id.key}. You said '{message.content}' and I disagree."
        )

class MyLLMAgent(RoutedAgent):
    def __init__(self) -> None:
        super().__init__("LLMAgent")
        model_client = OpenAIChatCompletionClient(model="gpt-4o-mini")
        self._delegate = AssistantAgent("LLMAgent", model_client=model_client)

    @message_handler
    async def handle_my_message_type(self, message: Message, ctx: MessageContext) -> Message:
        print(f"{self.id.type} received message: {message.content}")
        text_message = TextMessage(content=message.content, source="user")
        response = await self._delegate.on_messages([text_message], ctx.cancellation_token)
        reply = response.chat_message.content
        print(f"{self.id.type} responded: {reply}")
        return Message(content=reply)
```

### Runtime Configuration

```python
async def main():
    runtime = SingleThreadedAgentRuntime()
    await SimpleAgent.register(runtime, "simple_agent", lambda: SimpleAgent())
    await MyLLMAgent.register(runtime, "LLMAgent", lambda: MyLLMAgent())

    runtime.start()  # Start processing messages in the background.
    
    # Agent communication
    response = await runtime.send_message(Message("Hi there!"), AgentId("LLMAgent", "default"))
    print(">>>", response.content)
    
    response = await runtime.send_message(Message(response.content), AgentId("simple_agent", "default"))
    print(">>>", response.content)
    
    response = await runtime.send_message(Message(response.content), AgentId("LLMAgent", "default"))
    
    await runtime.stop()
    await runtime.close()
```

### Communication Flow

```text
User Input → Runtime → LLM Agent → OpenAI API → Response → Simple Agent → Response → LLM Agent → Final Output
```

## 🚀 Getting Started

### Prerequisites

- Python 3.14+
- OpenAI API key
- UV package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd 41-autogen_core
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
LLMAgent received message: Hi there!
LLMAgent responded: Hello! I'm an AI assistant powered by AutoGen Core. How can I help you today?
>>> Hello! I'm an AI assistant powered by AutoGen Core. How can I help you today?
>>> This is simple_agent-default. You said 'Hello! I'm an AI assistant powered by AutoGen Core. How can I help you today?' and I disagree.
LLMAgent received message: This is simple_agent-default. You said 'Hello! I'm an AI assistant powered by AutoGen Core. How can I help you today?' and I disagree.
```

## 🔧 Configuration

### Agent Configuration

- **SimpleAgent**: Basic agent with predefined response pattern
- **LLMAgent**: LLM-powered agent using OpenAI gpt-4o-mini
- **Runtime**: SingleThreadedAgentRuntime for message processing
- **Message Protocol**: Custom Message dataclass for typed communication

### Model Settings

- **Model**: `gpt-4o-mini`
- **Client**: OpenAIChatCompletionClient
- **Delegation**: AssistantAgent for LLM capabilities
- **Message Type**: TextMessage for LLM communication

## 🎓 Key Learnings

1. **AutoGen Core Fundamentals**: Understanding the core framework architecture
2. **Custom Agent Creation**: Building agents with RoutedAgent base class
3. **Message Handling**: Implementing typed message protocols with decorators
4. **Runtime Management**: Agent lifecycle and runtime configuration
5. **LLM Integration**: Delegation patterns for AI model integration
6. **Asynchronous Programming**: Async/await patterns in agent communication

## 🐛 Troubleshooting

### Common Issues

1. **Agent Registration**: Ensure agents are registered before runtime.start()
2. **Message Types**: Verify message types match handler signatures
3. **Runtime Lifecycle**: Always call stop() and close() after runtime usage
4. **API Key Issues**: Verify OpenAI API key is correctly set in environment
5. **Dependency Conflicts**: Ensure compatible AutoGen versions

### Debug Mode

For debugging agent communication, you can add logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# This will show detailed agent runtime information
```

### Error Recovery

The system includes built-in error handling:

```python
try:
    response = await runtime.send_message(message, agent_id)
except Exception as e:
    logger.error(f"Agent communication failed: {e}")
    # Implement fallback or retry logic
```

## 🔗 Dependencies

```toml
dependencies = [
    "autogen-agentchat==0.4.9.3",      # Agent framework
    "autogen-core>=0.4.9.3",           # Core framework
    "autogen-ext>=0.4.0",              # OpenAI extensions
    "openai>=1.0.0",                   # OpenAI API client
    "python-dotenv>=1.2.1",            # Environment variables
    "tiktoken>=0.5.0",                 # Token counting
]
```

## 🌟 Highlights

- **Framework Fundamentals**: Deep dive into AutoGen Core architecture
- **Custom Agent Patterns**: Demonstrates extensible agent design
- **Type Safety**: Dataclass-based message protocols
- **Runtime Management**: Professional agent lifecycle handling
- **LLM Integration**: Seamless OpenAI model integration
- **Communication Patterns**: Inter-agent messaging with routing

## 🔍 Advanced Features

- **Agent Registration**: Dynamic agent registration with factory patterns
- **Message Routing**: Type-safe message handling with decorators
- **Runtime States**: Proper runtime lifecycle management
- **Delegation Patterns**: Clean separation between agents and LLMs
- **Error Handling**: Robust exception management in async contexts
- **Extensibility**: Easy to add new agent types and message protocols

## 📝 Notes

- The system demonstrates AutoGen Core's low-level agent capabilities
- Message handlers use decorators for type-safe routing
- Runtime management follows proper async patterns
- LLM integration uses delegation for clean architecture
- The framework supports complex multi-agent workflows
- Custom message types enable flexible communication protocols

## 🚀 Future Enhancements

1. **Multi-Runtime Support**: Multiple agent runtimes with communication
2. **Advanced Message Types**: Complex message protocols with validation
3. **Agent State Management**: Persistent agent state across sessions
4. **Performance Monitoring**: Agent performance metrics and logging
5. **Security Features**: Message encryption and access controls
6. **Configuration Management**: YAML/JSON configuration for agents
7. **Testing Framework**: Comprehensive agent testing utilities

---

**Project Repository**: [41-autogen_core](./41-autogen_core/)