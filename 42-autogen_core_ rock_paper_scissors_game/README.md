# 42-autogen_core_rock_paper_scissors_game - Multi-Agent Rock Paper Scissors Game

**Category**: Multi-Agent Systems | **Frameworks**: Microsoft AutoGen Core | **Language**: Python 3.14+

A sophisticated multi-agent rock paper scissors game implementation using Microsoft AutoGen Core framework, featuring hybrid AI models (OpenAI and Ollama), inter-agent communication, and intelligent game arbitration.

## 🎯 Key Features

- **🤖 Multi-Agent Architecture**: Three specialized agents with distinct roles
- **🧠 Hybrid AI Models**: OpenAI GPT-4o-mini and Ollama Llama3.2 integration
- **🎮 Game Logic**: Complete rock paper scissors game with intelligent judging
- **🔄 Agent Communication**: Inter-agent messaging with typed protocols
- **⚡ Asynchronous Processing**: Full async/await support for concurrent operations
- **🏛️ Runtime Management**: Professional agent lifecycle and coordination

## 🏗️ Architecture

### Agent System Design

The system implements three specialized agents working together:

```python
from dataclasses import dataclass
from autogen_core import AgentId, MessageContext, RoutedAgent, message_handler
from autogen_core import SingleThreadedAgentRuntime
from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_ext.models.ollama import OllamaChatCompletionClient

@dataclass
class Message:
    content: str

class Player1Agent(RoutedAgent):
    def __init__(self, name: str) -> None:
        super().__init__(name)
        model_client = OpenAIChatCompletionClient(model="gpt-4o-mini", temperature=1.0)
        self._delegate = AssistantAgent(name, model_client=model_client)

    @message_handler
    async def handle_my_message_type(self, message: Message, ctx: MessageContext) -> Message:
        text_message = TextMessage(content=message.content, source="user")
        response = await self._delegate.on_messages([text_message], ctx.cancellation_token)
        return Message(content=response.chat_message.content)

class Player2Agent(RoutedAgent):
    def __init__(self, name: str) -> None:
        super().__init__(name)
        model_client = OllamaChatCompletionClient(model="llama3.2", temperature=1.0)
        self._delegate = AssistantAgent(name, model_client=model_client)

    @message_handler
    async def handle_my_message_type(self, message: Message, ctx: MessageContext) -> Message:
        text_message = TextMessage(content=message.content, source="user")
        response = await self._delegate.on_messages([text_message], ctx.cancellation_token)
        return Message(content=response.chat_message.content)
```

### Game Coordinator Agent

```python
class RockPaperScissorsAgent(RoutedAgent):
    def __init__(self, name: str) -> None:
        super().__init__(name)
        model_client = OpenAIChatCompletionClient(model="gpt-4o-mini", temperature=1.0)
        self._delegate = AssistantAgent(name, model_client=model_client)

    @message_handler
    async def handle_my_message_type(self, message: Message, ctx: MessageContext) -> Message:
        instruction = "You are playing rock, paper, scissors. Respond only with the one word, one of the following: rock, paper, or scissors."
        instruction_message = Message(content=instruction)
        inner_1 = AgentId("player1", "default")
        inner_2 = AgentId("player2", "default")
        response1 = await self.send_message(instruction_message, inner_1)
        response2 = await self.send_message(instruction_message, inner_2)
        result = f"Player 1: {response1.content}\nPlayer 2: {response2.content}\n"
        judgement = f"{JUDGE}{result}Who wins?"
        judgement_message = TextMessage(content=judgement, source="user")
        response = await self._delegate.on_messages([judgement_message], ctx.cancellation_token)
        return Message(content=result + response.chat_message.content)
```

### Runtime Configuration

```python
async def main():
    runtime = SingleThreadedAgentRuntime()
    await Player1Agent.register(runtime, "player1", lambda: Player1Agent("player1"))
    await Player2Agent.register(runtime, "player2", lambda: Player2Agent("player2"))
    await RockPaperScissorsAgent.register(runtime, "rock_paper_scissors", lambda: RockPaperScissorsAgent("rock_paper_scissors"))
    runtime.start()

    agent_id = AgentId("rock_paper_scissors", "default")
    message = Message(content="go")
    response = await runtime.send_message(message, agent_id)
    print(response.content)

    await runtime.stop()
    await runtime.close()
```

### Communication Flow

```text
User Trigger → Game Coordinator → Player 1 (OpenAI) → Choice
                                    ↓
                              Player 2 (Ollama) → Choice
                                    ↓
                              Game Judge (OpenAI) → Result
                                    ↓
                              Final Output to User
```

## 🚀 Getting Started

### Prerequisites

- Python 3.14+
- OpenAI API key
- Ollama installed and running with Llama3.2 model
- UV package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd 42-autogen_core_rock_paper_scissors_game
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

4. Ensure Ollama is running with Llama3.2:

```bash
# Install and run Ollama
ollama pull llama3.2
ollama serve
```

### Running the Project

```bash
uv run main.py
```

## 📊 Example Output

```text
Player 1: rock
Player 2: scissors
Player 1 wins because rock crushes scissors. TERMINATE
```

```text
Player 1: paper
Player 2: paper
The game results in a tie since both players chose paper. TERMINATE
```

## 🔧 Configuration

### Agent Configuration

- **Player1Agent**: Uses OpenAI GPT-4o-mini for strategic gameplay
- **Player2Agent**: Uses Ollama Llama3.2 for local AI gameplay
- **RockPaperScissorsAgent**: Coordinates game and judges outcomes using OpenAI

### Model Settings

- **OpenAI Model**: `gpt-4o-mini` (temperature: 1.0 for creativity)
- **Ollama Model**: `llama3.2` (temperature: 1.0 for variety)
- **Judge Prompt**: Specialized game analysis and outcome determination

### Game Rules

- Standard rock paper scissors rules apply
- Rock beats scissors
- Scissors beats paper
- Paper beats rock
- Same choices result in a tie

## 🎓 Key Learnings

1. **Multi-Agent Coordination**: Managing multiple specialized agents
2. **Hybrid AI Integration**: Combining cloud and local AI models
3. **Inter-Agent Communication**: Message passing between agents
4. **Game Logic Implementation**: Complex game state management
5. **Runtime Orchestration**: Coordinating agent interactions
6. **Model Comparison**: Different AI behaviors and strategies

## 🐛 Troubleshooting

### Common Issues

1. **Ollama Connection**: Ensure Ollama is running and Llama3.2 is available
2. **OpenAI API**: Verify API key is correctly set in environment
3. **Agent Registration**: Ensure all agents are registered before runtime.start()
4. **Model Availability**: Check that both AI models are accessible
5. **Temperature Settings**: Adjust temperature for different gameplay styles

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
    "autogen-ext>=0.4.9.3",            # OpenAI and Ollama extensions
    "openai>=1.0.0",                   # OpenAI API client
    "python-dotenv>=1.2.1",            # Environment variables
    "tiktoken>=0.5.0",                 # Token counting
    "ollama>=0.6.1",                   # Ollama client
]
```

## 🌟 Highlights

- **Hybrid AI Architecture**: Combines cloud and local AI models
- **Multi-Agent Coordination**: Three specialized agents working together
- **Game Intelligence**: AI-powered strategic gameplay
- **Real-time Communication**: Asynchronous agent messaging
- **Extensible Design**: Easy to add more players or game variants
- **Professional Runtime**: Production-ready agent lifecycle management

## 🔍 Advanced Features

- **Agent Specialization**: Each agent has a specific role and capability
- **Model Diversity**: Different AI models for varied gameplay experiences
- **Intelligent Judging**: AI-powered game outcome analysis
- **Message Protocols**: Type-safe communication between agents
- **Runtime Management**: Professional agent lifecycle handling
- **Error Handling**: Robust exception management in async contexts
- **Scalability**: Easy to extend with more players or game types

## 📝 Technical Notes

- The system demonstrates advanced multi-agent coordination patterns
- Hybrid AI integration showcases flexibility in model selection
- Game logic is implemented through intelligent agent communication
- Runtime management follows proper async patterns and lifecycle
- The architecture supports easy extension and customization
- Agent communication uses typed message protocols for reliability

## 🚀 Future Enhancements

1. **Multi-Player Support**: Extend to more than two players
2. **Tournament Mode**: Implement elimination tournaments
3. **Statistics Tracking**: Track win rates and player strategies
4. **GUI Interface**: Add visual game interface
5. **Network Play**: Enable multiplayer over network
6. **AI Strategy Learning**: Implement adaptive AI strategies
7. **Game Variants**: Add rock paper scissors lizard spock and other variants

---

**Project Repository**: [42-autogen_core_rock_paper_scissors_game](./42-autogen_core_rock_paper_scissors_game/)
