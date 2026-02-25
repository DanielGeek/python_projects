# 44 - AutoGen Agent-to-Agent Communication System

## 📋 Description

This project demonstrates a sophisticated **multi-agent ecosystem** where agents can dynamically create other agents and communicate with each other using AutoGen Core with gRPC. The system features a Creator agent that generates new specialized agents based on a template, and these agents can collaborate and refine ideas among themselves.

## 🏗️ Architecture

### **Core Components:**

- **Creator**: Specialized agent that creates new AI agents dynamically
- **Agent**: Base template for all generated agents with unique personalities
- **Messages**: Communication protocol between agents
- **World**: Orchestrator that manages the entire ecosystem

### **Key Features:**

- ✅ **Dynamic Agent Creation**: Agents can create other agents programmatically
- ✅ **gRPC Communication**: High-performance distributed agent communication
- ✅ **Agent Collaboration**: Agents can bounce ideas off each other for refinement
- ✅ **Template-Based Generation**: Uses a base template with unique system messages
- ✅ **Organized Structure**: Agents and ideas stored in dedicated folders

## 🚀 Features

### **Agent Ecosystem:**

- **Creator Agent**: Generates new agents with unique characteristics
- **Specialized Agents**: Each agent has distinct personality and expertise
- **Communication Protocol**: Agents can exchange messages and ideas
- **Idea Refinement**: Agents collaborate to improve concepts

### **Technical Capabilities:**

- **Distributed Architecture**: gRPC-based agent runtime
- **Dynamic Registration**: Agents register themselves at runtime
- **Random Selection**: Agents randomly select partners for collaboration
- **Concurrent Execution**: Multiple agents operate simultaneously

## 🛠️ Installation

### **Prerequisites:**

- Python 3.13
- uv package manager
- OpenAI API key

### **Installation Steps:**

```bash
# Clone the project
cd /Users/thepunisher/Documents/GitHub/python_projects/44-autogen_agent-to-agent

# Install dependencies
uv sync

# Configure environment variables
cp .env.example .env
# Edit .env with your OpenAI API key
```

### **Environment Variables (.env):**
```env
OPENAI_API_KEY=your_openai_api_key_here
```

## 🎮 Usage

### **System Execution:**

```bash
# Run the agent ecosystem
uv run world.py
```

### **What Happens:**

1. **Creator Activation**: The Creator agent starts generating new agents
2. **Agent Generation**: 20 unique agents are created with different personalities
3. **Agent Registration**: Each agent registers with the gRPC runtime
4. **Idea Generation**: Each agent generates an initial idea
5. **Collaboration**: Agents exchange and refine ideas with each other
6. **Output Storage**: Ideas are saved in the `ideas/` folder

### **Expected Output:**

```text
agents/
├── agent1.py
├── agent2.py
├── agent3.py
└── ... (20 total agents)

ideas/
├── idea1.md
├── idea2.md
├── idea3.md
└── ... (20 total ideas)
```

## 🔧 Configuration

### **Customization Options:**

```python
# In world.py
HOW_MANY_AGENTS = 20  # Number of agents to create
HOST_URL = "localhost:50051"  # gRPC server address
```

### **Agent Behavior:**

Each generated agent has:

- **Unique System Message**: Different personality and expertise
- **Communication Probability**: Chance to collaborate with others
- **Random Selection**: Chooses random partners for idea exchange

## 🎓 Key Concepts

### **Agent Creation Process:**
1. **Template Analysis**: Creator reads the base agent template
2. **LLM Generation**: Uses GPT-4o-mini to create unique agent code
3. **File Creation**: Saves agent code in `agents/` folder
4. **Dynamic Import**: Imports and registers the new agent
5. **Activation**: Agent becomes part of the ecosystem

### **Communication Flow:**

1. **Initial Request**: Each agent receives "Give me an idea"
2. **Idea Generation**: Agent creates a response based on its personality
3. **Collaboration Chance**: Random probability to bounce idea off another agent
4. **Refinement**: Selected agent provides feedback or improvements
5. **Final Output**: Refined idea is saved to `ideas/` folder

## 📈 Metrics

- **Agent Count**: Configurable (default: 20 agents)
- **Response Time**: ~2-5 seconds per agent interaction
- **API Usage**: ~40-60 OpenAI calls per full execution
- **Concurrent Operations**: All agents operate in parallel
- **Collaboration Rate**: ~30% chance of idea exchange per interaction

## 🔄 Workflow

1. **Initialization**: gRPC host and worker runtime start
2. **Creator Registration**: Creator agent registers with the system
3. **Agent Generation**: Creator creates N unique agents
4. **Parallel Processing**: All agents generate initial ideas
5. **Collaborative Refinement**: Agents exchange and improve ideas
6. **Output Storage**: Final ideas saved to markdown files
7. **System Shutdown**: Clean termination of all components

## 🎨 Agent Diversity

The system generates agents with various characteristics:

- **Different Business Verticals**: Tech, finance, healthcare, education, etc.
- **Varied Personalities**: Analytical, creative, strategic, practical
- **Unique Expertise**: Each agent specializes in different domains
- **Distinct Communication Styles**: Formal, casual, technical, creative

## 🤝 Contributions

### **Extension Ideas:**

1. **Agent Templates**: Create different base agent templates
2. **Communication Protocols**: Implement more complex interaction patterns
3. **Memory System**: Add persistent memory for agents
4. **Performance Metrics**: Track agent collaboration effectiveness
5. **GUI Interface**: Build a web interface to monitor the ecosystem

### **Customization:**

- Modify `Creator.system_message` to change agent generation criteria
- Adjust `Agent.CHANCES_THAT_I_BOUNCE_IDEA_OFF_ANOTHER` for collaboration frequency
- Update temperature settings for more/less creative responses

## 📦 Dependencies

- **autogen-agentchat>=0.7.5**: Agent framework
- **autogen-core>=0.7.5**: Core agent functionality
- **autogen-ext>=0.7.5**: Extensions including gRPC
- **openai>=2.21.0**: OpenAI API client
- **python-dotenv>=1.2.1**: Environment variable management
- **grpcio==1.70.0**: gRPC communication (installed automatically)

## 🐛 Troubleshooting

### **Common Issues:**

1. **Import Errors**: Ensure agents folder is in Python path
2. **gRPC Connection**: Check if port 50051 is available
3. **API Key Issues**: Verify OpenAI API key is correctly set
4. **File Permissions**: Ensure write access to agents/ and ideas/ folders

### **Debug Tips:**

- Monitor console logs for agent registration status
- Check generated agent files in agents/ folder
- Verify idea generation in ideas/ folder
- Use lower agent count for testing (set HOW_MANY_AGENTS = 5)

## 📄 License

This project is for educational and demonstration purposes, showcasing advanced multi-agent systems and dynamic agent creation.

---

**AutoGen Agent-to-Agent Communication System** - Dynamic multi-agent ecosystem with collaborative intelligence
