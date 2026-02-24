# 43 - AutoGen Core Distributed Agents

## 📋 Description

This project demonstrates the use of **AutoGen Core with gRPC** to create a distributed agent system that can collaborate with each other through remote communication. The system implements a decision-making scenario where multiple agents research different perspectives and a judge agent makes a final decision based on the research.

## 🏗️ Architecture

### **Main Components:**

- **GrpcWorkerAgentRuntimeHost**: gRPC server that manages communication between agents
- **Player1Agent**: Agent that researches pros of using AutoGen
- **Player2Agent**: Agent that researches cons of using AutoGen  
- **Judge**: Agent that makes the final decision based on the research

### **Operation Modes:**

1. **ALL_IN_ONE_WORKER = True**: All agents run in the same local runtime
2. **ALL_IN_ONE_WORKER = False**: Each agent runs in its own distributed runtime

## 🚀 Features

- ✅ **gRPC Communication**: Distributed agents with remote communication
- ✅ **Internet Search**: Integration with Google Serper API
- ✅ **Multi-Agent**: Collaborative system with specialized roles
- ✅ **Decision Making**: Structured analysis and decision process
- ✅ **LangChain Integration**: Adapted search tools

## 🛠️ Installation

### **Prerequisites:**

- Python 3.13 (important: Python 3.14 is not compatible with grpcio)
- uv package manager
- OpenAI API key
- Google Serper API key

### **Installation Steps:**

```bash
# Clone the project
cd /Users/thepunisher/Documents/GitHub/python_projects/43-autogen_core_distributed

# Install dependencies with Python 3.13
uv add "autogen-ext[grpc]" --python 3.13
uv add langchain-community

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys
```

### **Environment Variables (.env):**
```env
OPENAI_API_KEY=your_openai_api_key
SERPER_API_KEY=your_serper_api_key
```

## 🎮 Usage

### **System Execution:**

```bash
# Run with all agents in a single worker
uv run main.py

# To switch to distributed mode, modify in main.py:
ALL_IN_ONE_WORKER = False
```

### **Expected Output:**

The system will generate:

1. **Pros of AutoGen**: Detailed research on advantages
2. **Cons of AutoGen**: Detailed research on disadvantages  
3. **Final Decision**: Judge's verdict with justification

## 🔧 Configuration

### **Scenario Customization:**

You can modify the instructions in `main.py`:

```python
instruction1 = "Research pros of [YOUR TOPIC]"
instruction2 = "Research cons of [YOUR TOPIC]" 
judge = "Make decision on [YOUR TOPIC] based on research"
```

### **gRPC Configuration:**

```python
host_address = "localhost:50051"  # Change port if necessary
```

## 🐛 Troubleshooting

### **Common Issues:**

1. **grpcio doesn't compile on Python 3.14**

```bash
# Solution: Use Python 3.13
uv python install 3.13
echo "3.13" > .python-version
```

1. **Event loop error with host.start()**

```python
# Solution: Create host inside main()
async def main():
    host = GrpcWorkerAgentRuntimeHost(address=host_address)
    host.start()
```

1. **gRPC connection timeout**

```python
# Solution: Ensure host is started before workers
host.start()
await asyncio.sleep(1)  # Small wait if necessary
```

## 📦 Dependencies

- **autogen-ext[grpc]>=0.7.5**: AutoGen Core with gRPC support
- **autogen-agentchat>=0.0.1**: Conversational agent framework
- **langchain-community>=0.4.1**: LangChain community tools
- **openai>=1.0.0**: OpenAI client
- **grpcio==1.70.0**: gRPC for Python (installed automatically)

## 🔄 Workflow

1. **Initialization**: The gRPC host starts and waits for connections
2. **Registration**: Agents register with the runtime
3. **Research**: Player1 and Player2 research in parallel
4. **Analysis**: The judge collects and analyzes information
5. **Decision**: A final decision is generated with justification

## 🎓 Key Concepts

- **Distributed Agents**: Agents running in separate processes
- **gRPC Communication**: High-performance remote communication
- **Multi-Agent Orchestration**: Coordination of multiple agents
- **Role-Based Agents**: Agents with specific responsibilities
- **Async/Await Patterns**: Asynchronous programming in Python

## 📈 Metrics

- **Response Time**: ~30-60 seconds for complete analysis
- **API Usage**: 2-3 OpenAI calls per execution
- **Concurrency**: Agents operate in parallel when possible

## 🤝 Contributions

To modify the system:

1. Change research instructions
2. Add new specialized agents
3. Modify decision criteria
4. Integrate additional tools

## 📄 License

This project is for educational and demonstration purposes.

---

**AutoGen Core Distributed Agents** - Multi-agent system demonstration with gRPC
