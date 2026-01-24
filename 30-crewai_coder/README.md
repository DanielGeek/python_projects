# 30-CrewAI-Coder: AI-Powered Code Generation & Execution System

A sophisticated multi-agent AI system powered by CrewAI that generates, executes, and validates Python code with real-time Docker-based code interpretation, optimized for computational tasks and mathematical calculations.

## 🎯 Overview

This project creates an intelligent coding assistant that can understand natural language programming requests, generate optimized Python code, execute it in a secure Docker environment, and provide accurate results with proper error handling and timeout management.

The system demonstrates advanced CrewAI capabilities including code execution, Docker integration, and computational performance optimization.

## 🚀 Key Features

### Docker Code Interpreter

- **Secure Code Execution**: Runs Python code in isolated Docker containers
- **Safe Mode**: `code_execution_mode="safe"` ensures complete system isolation
- **Automatic Container Management**: CrewAI handles Docker lifecycle automatically
- **Cross-Platform Compatibility**: Works consistently across different operating systems

### Optimized Performance

- **Extended Timeout**: 120-second execution window for intensive calculations
- **Retry Logic**: Up to 5 retry attempts for failed executions
- **Error Handling**: Comprehensive timeout and execution error management
- **Performance Monitoring**: Detailed execution traces and timing information

### Intelligent Code Generation

- **Natural Language Understanding**: Interprets complex programming requirements
- **Mathematical Computations**: Handles series calculations, approximations, and algorithms
- **Code Optimization**: Generates efficient and readable Python code
- **Result Validation**: Verifies computational accuracy and outputs

### Professional Output Management

- **Structured Results**: Clean code output with execution results
- **File Generation**: Saves code and output to `output/code_and_output.txt`
- **Trace Integration**: Full execution tracing with CrewAI Plus integration
- **Verbose Logging**: Detailed step-by-step execution information

## 🚀 Quick Start

### Prerequisites

- Python >=3.10 and <3.14
- OpenAI API key
- Docker Desktop (installed and running)
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

# Edit .env with your API keys
# OPENAI_API_KEY=your_openai_api_key_here
# CREWAI_TRACING_ENABLED=true
```

#### 4. Install Project Dependencies

```bash
crewai install
```

#### 5. Run Code Generation

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

# Update CrewAI CLI
uv tool install crewai --upgrade
```

### Project Structure

```text
30-crewai_coder/
├── .gitignore
├── knowledge/                    # Knowledge base files
├── pyproject.toml               # Project dependencies
├── README.md
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── output/                      # Generated code files
│   └── code_and_output.txt      # Code execution results
└── src/
    └── crewai_coder/
        ├── __init__.py
        ├── main.py             # Entry point with coding assignments
        ├── crew.py             # Crew orchestration with Docker execution
        └── config/
            ├── agents.yaml     # Python Developer agent configuration
            └── tasks.yaml      # Coding task definitions
```

## 🐳 Docker Code Interpreter Architecture

### Code Execution Flow

```python
@agent
def coder(self) -> Agent:
    return Agent(
        config=self.agents_config['coder'],
        verbose=True,
        allow_code_execution=True,        # Enables Code Interpreter
        code_execution_mode="safe",       # Uses Docker containers
        max_execution_time=120,          # 120-second timeout
        max_retry_limit=5,               # Retry failed executions
    )
```

### Docker Integration Benefits

**Security & Isolation:**

- Code runs in isolated Docker containers
- No access to host system files or processes
- Clean environment for each execution
- Automatic container cleanup

**Performance & Reliability:**

- Consistent execution environment
- Pre-configured Python libraries
- Resource monitoring and limits
- Timeout protection and error handling

## 📊 Code Generation Examples

### Mathematical Series Calculation

**Input:** "Write a python program to calculate the first 10,000 terms of this series, multiplying the total by 4: 1 - 1/3 + 1/5 - 1/7 + ..."

**Generated Code:**

```python
# Python program to calculate the first 10,000 terms of the series
total = 0.0
for n in range(10000):
    if n % 2 == 0:
        total += 1 / (2 * n + 1)
    else:
        total -= 1 / (2 * n + 1)

result = total * 4
print(result)

# Output of the code
3.1414926535900345
```

### Execution Process

```bash
🤖 Agent Started: Python Developer
🔧 Tool Execution: Code Interpreter
Running code in Docker environment...
✅ Agent Final Answer: Complete code with results
📊 Output: 3.1414926535900345 (π approximation)
```

## 🔧 Customization

### Change Execution Parameters

Edit `src/crewai_coder/crew.py`:

```python
@agent
def coder(self) -> Agent:
    return Agent(
        config=self.agents_config['coder'],
        verbose=True,
        allow_code_execution=True,
        code_execution_mode="safe",
        max_execution_time=180,        # Increase for longer calculations
        max_retry_limit=3,             # Adjust retry attempts
    )
```

### Modify Coding Tasks

Edit `src/crewai_coder/main.py`:

```python
# Custom programming assignments
assignment = '''
Write a Python program to:
1. Generate Fibonacci sequence up to 1000
2. Calculate prime numbers up to 100
3. Create a data visualization with matplotlib
'''

inputs = {"assignment": assignment}
```

### Configure Agent Behavior

Edit `src/crewai_coder/config/agents.yaml`:

```yaml
coder:
  role: >
    Senior Python Developer and Mathematical Computing Expert
  goal: >
    Generate optimized Python code for complex computational tasks,
    mathematical calculations, and data analysis problems
  backstory: >
    You are an expert Python developer with deep knowledge in
    numerical computing, algorithms, and mathematical modeling.
    You write clean, efficient, and well-documented code.
```

## 🔧 Troubleshooting

### Common Issues

**Docker Not Running:**
```bash
# Start Docker Desktop
# Verify Docker is working
docker --version
docker run hello-world
```

**Timeout Errors:**
- Increase `max_execution_time` in crew.py
- Optimize code for better performance
- Check computational complexity of algorithms

**API Key Issues:**
- Verify OPENAI_API_KEY in .env file
- Check API key permissions and billing
- Ensure CrewAI tracing is properly configured

**Code Execution Failures:**
- Check Docker container status
- Verify code syntax and dependencies
- Review error logs in verbose mode

## 🎨 Features

### Core Capabilities
- **Natural Language to Code**: Convert programming descriptions into executable Python
- **Docker Security**: Safe code execution in isolated containers
- **Mathematical Computing**: Handle complex calculations and series approximations
- **Performance Optimization**: Configurable timeouts and retry mechanisms
- **Result Management**: Structured output with code and execution results

### Advanced Features
- **Execution Tracing**: Full debugging and performance monitoring
- **Error Recovery**: Automatic retry logic for failed executions
- **Cross-Platform**: Consistent behavior across operating systems
- **Scalable Architecture**: Easy to extend with additional coding capabilities
- **Professional Output**: Clean, documented code with proper formatting

## 🚀 Production Features

- **Secure Execution**: Docker-based isolation for code safety
- **Performance Monitoring**: Detailed execution timing and resource usage
- **Error Handling**: Comprehensive timeout and failure management
- **Scalable Design**: Modular configuration for different coding tasks
- **Professional Output**: Production-ready code generation and validation

## 📈 Performance Benchmarks

### Mathematical Calculations
- **Series Approximation**: 10,000 terms in <30 seconds
- **Fibonacci Generation**: Up to 10,000 numbers efficiently
- **Prime Number Calculation**: Optimized algorithms for speed
- **Data Processing**: Handle large datasets with proper memory management

### Execution Metrics
- **Docker Startup**: ~2-3 seconds container initialization
- **Code Compilation**: Python bytecode generation and optimization
- **Memory Usage**: Efficient resource management in containers
- **Cleanup**: Automatic container disposal after execution

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your improvements
4. Submit a pull request

## 📚 Resources

- [CrewAI Documentation](https://docs.crewai.com)
- [CrewAI GitHub](https://github.com/joaomdmoura/crewai)
- [CrewAI Discord](https://discord.com/invite/X4JWnZnxPb)
- [Docker Documentation](https://docs.docker.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ using [CrewAI](https://crewai.com) - Creating intelligent code generation systems with Docker-based execution and mathematical computation capabilities.
