# 27-CrewAI-Debate: Multi-Agent Debate System

A sophisticated multi-agent debate system powered by [CrewAI](https://crewai.com) that simulates structured debates on complex topics with AI agents taking different positions. This project demonstrates the power of multi-agent AI systems by creating a debate environment where agents argue different sides of a topic, provide rebuttals, and a moderator evaluates the arguments objectively.

## 🎯 Overview

This project creates an intelligent debate system with three specialized AI agents:
- **Pro-Regulation Advocate**: Argues in favor of government AI regulation
- **Anti-Regulation Advocate**: Argues against government AI regulation  
- **Debate Moderator**: Facilitates the debate and provides objective analysis

The system follows a structured debate flow: opening arguments → rebuttals → final analysis, with context-aware responses where agents reference previous arguments.

## 🚀 Quick Start

### Prerequisites

- Python >=3.10 and <3.14
- OpenAI API key
- UV package manager

### Installation & Setup

#### 1. Install UV (if not already installed)

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

#### 2. Install CrewAI CLI

```bash
uv tool install crewai --python 3.12
```

#### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your OpenAI API key
# OPENAI_API_KEY=sk-proj-your-key-here
```

#### 4. Install Project Dependencies

```bash
crewai install
```

#### 5. Run the Debate

```bash
crewai run
```

## 🛠️ CrewAI CLI Commands

### Essential Commands

```bash
# Create new CrewAI project
crewai create crew <project-name>

# Install dependencies for existing project
crewai install

# Run the crew
crewai run

# Run with verbose output
crewai run --verbose

# Enable tracing for debugging
crewai traces enable

# Disable tracing
crewai traces disable

# List available tools
crewai --help

# Update CrewAI CLI
uv tool install crewai --upgrade
```

### Project Structure

```
27-crewai-debate/
├── .gitignore
├── knowledge/              # Knowledge base files
├── pyproject.toml         # Project dependencies
├── README.md
├── .env                   # Environment variables
└── src/
    └── crewai_debate/
        ├── __init__.py
        ├── main.py        # Entry point
        ├── crew.py        # Crew orchestration
        ├── tools/
        │   ├── custom_tool.py
        │   └── __init__.py
        └── config/
            ├── agents.yaml    # Agent definitions
            └── tasks.yaml     # Task definitions
```

## 📊 How It Works

### Debate Structure

1. **Opening Arguments** (Sequential)
   - Pro-regulation agent presents case (300-400 words)
   - Anti-regulation agent presents case (300-400 words)

2. **Rebuttals** (Context-aware)
   - Pro-regulation agent rebuts anti-regulation arguments (200-300 words)
   - Anti-regulation agent rebuts pro-regulation arguments (200-300 words)

3. **Final Analysis** (Comprehensive)
   - Moderator evaluates both sides objectively (400-500 words)
   - Identifies strongest arguments and logical fallacies
   - Provides balanced conclusion

### Agent Configuration

Each agent has:

- **Role**: Specific position or function
- **Goal**: What they're trying to achieve
- **Backstory**: Context and expertise
- **Verbose**: Detailed output enabled
- **Allow Delegation**: Disabled for focused arguments

### Customization

#### Modify the Debate Topic
Edit the debate topic in `src/crewai_debate/config/tasks.yaml` or in the crew logic.

#### Add More Agents
1. Define new agents in `config/agents.yaml`
2. Create corresponding tasks in `config/tasks.yaml`
3. Update the crew orchestration in `crew.py`

#### Change LLM Model
Edit the `.env` file:

```bash
MODEL=gpt-4o-mini  # or gpt-4, gpt-3.5-turbo, etc.
```

## 📈 Example Output

The debate produces:

1. **Pro-Regulation Opening**: Structured argument with evidence
2. **Anti-Regulation Opening**: Counter-argument with examples
3. **Pro-Regulation Rebuttal**: Response to opposition points
4. **Anti-Regulation Rebuttal**: Response to opposition points
5. **Moderator Analysis**: Comprehensive evaluation

## 🔧 Troubleshooting

### Common Issues

**Python Version Error**:

```bash
# Ensure using Python 3.12
export UV_PYTHON=3.12
crewai run
```

**API Key Issues**:

- Verify your `.env` file contains valid `OPENAI_API_KEY`
- Check OpenAI API quota and billing

**CrewAI Installation Issues**:

```bash
# Clear cache and reinstall
uv cache clean
uv tool install crewai --upgrade --python 3.12
```

## 🎨 Features

### Core Capabilities

- **Multi-Agent Architecture**: Three specialized agents
- **Structured Debate Flow**: Opening arguments → Rebuttals → Final analysis
- **Context-Aware Responses**: Agents reference previous arguments
- **Objective Moderation**: Independent moderator evaluates both sides
- **Sequential Processing**: Ensures logical debate progression

### Advanced Features

- **Tracing & Debugging**: Built-in execution tracing with CrewAI Cloud
- **Customizable Topics**: Easy to modify debate subjects
- **Extensible Architecture**: Add more agents and tasks
- **Knowledge Integration**: Support for external knowledge bases

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your improvements
4. Submit a pull request

## 📚 Resources

- [CrewAI Documentation](https://docs.crewai.com)
- [CrewAI GitHub](https://github.com/joaomdmoura/crewai)
- [CrewAI Discord](https://discord.com/invite/X4JWnZnxPb)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ using [CrewAI](https://crewai.com) - Creating intelligent multi-agent systems.
