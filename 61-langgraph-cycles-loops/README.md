# LangGraph Cycles and Loops - Advanced Workflow Patterns

A comprehensive exploration of advanced LangGraph patterns including self-correcting agents, iterative workflows, and human-in-the-loop systems.

## 🎯 Overview

This project demonstrates sophisticated workflow patterns in LangGraph that go beyond simple linear processing. It showcases how to build intelligent systems that can self-correct, iterate, and collaborate with humans to achieve complex tasks.

## 🚀 Key Features

### **1. Self-Correcting Code Generator**
- **Automatic Error Detection**: Syntax and runtime validation
- **Iterative Refinement**: Multiple attempts to fix errors
- **Test-Driven Validation**: Automated testing against expected outputs
- **Intelligent Code Generation**: Context-aware code improvement

### **2. Iterative Research Workflow**
- **Progressive Deepening**: Multi-layer research with increasing depth
- **Question-Driven Exploration**: Dynamic question generation based on findings
- **Knowledge Synthesis**: Automatic summarization of research findings
- **Adaptive Depth Control**: Configurable research depth limits

### **3. Human-in-the-Loop Approval System**
- **Checkpoint Management**: Pause execution for human review
- **State Inspection**: Examine workflow state at any point
- **Feedback Integration**: Incorporate human feedback into automated processes
- **Resume Capability**: Continue execution after human intervention

### **4. Iterative Review System**
- **Multi-Round Review**: Multiple cycles of review and revision
- **Comment Tracking**: Maintain history of all review comments
- **Status Management**: Track document status through review process
- **Automatic Revision**: AI-powered document improvements based on feedback

## 🏗️ Architecture

### **Core Components**

#### **State Management**

```python
class CodeGenState(TypedDict):
    task: str
    code: str
    errors: Annotated[list[str], operator.add]
    iteration: int
    max_iterations: int
    success: bool
```

#### **Graph Patterns**

- **Conditional Loops**: Smart continuation logic based on success criteria
- **Interrupt Points**: Strategic pauses for human interaction
- **State Persistence**: Memory-backed state management
- **Dynamic Routing**: Intelligent path selection based on current state

#### **Validation Framework**

- **Syntax Checking**: Compile-time error detection
- **Runtime Testing**: Execution validation with test cases
- **Error Aggregation**: Comprehensive error reporting
- **Success Criteria**: Configurable success conditions

## 📋 Demonstrations

### **Demo 1: Self-Correcting Code Generator**

```python
result = app.invoke({
    "task": "a function that calculates factorial recursively",
    "code": "",
    "errors": [],
    "iteration": 0,
    "max_iterations": 3,
    "success": False,
})
```

**Features:**

- Generates initial code based on task description
- Validates code against test cases
- Iteratively fixes errors until success or max iterations
- Provides detailed error feedback for debugging

### **Demo 2: Iterative Research Workflow**

```python
result = app.invoke({
    "topic": "quantum computing applications",
    "findings": [],
    "questions": [],
    "iteration": 0,
    "max_depth": 2,
    "summary": "",
})
```

**Features:**

- Conducts multi-layer research on complex topics
- Generates follow-up questions based on findings
- Synthesizes comprehensive summaries
- Adapts research depth based on topic complexity

### **Demo 3: Human-in-the-Loop Approval**

```python
# Phase 1: Run until interrupt
result = app.invoke(initial_state, config)

# Phase 2: Inspect and modify state
app.update_state(config, {"approved": False, "feedback": "Make it more concise"})

# Phase 3: Resume execution
final_result = app.invoke(None, config)
```

**Features:**

- Pauses execution at strategic points
- Allows human review and modification
- Maintains state consistency across interruptions
- Provides transparent workflow control

### **Demo 4: Iterative Review System**

```python
# Multiple rounds of review and revision
for round in range(num_reviews):
    app.update_state(config, {"review_comments": [feedback], "status": "needs_revision"})
    result = app.invoke(None, config)
```

**Features:**

- Supports unlimited review cycles
- Tracks all comments and revisions
- Maintains document history
- Provides clear approval workflows

## 🛠️ Technical Implementation

### **Dependencies**

```python
from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from typing_extensions import TypedDict, Annotated
from typing import Literal
import operator
```

### **Key Patterns**

#### **1. Conditional Looping**

```python
def should_continue(state: CodeGenState) -> Literal["generate", "end"]:
    if state["success"]:
        return "end"
    if state["iteration"] >= state["max_iterations"]:
        return "end"
    return "generate"
```

#### **2. State Accumulation**

```python
errors: Annotated[list[str], operator.add]  # Auto-concatenates
findings: Annotated[list[str], operator.add]  # Auto-concatenates
```

#### **3. Interrupt Management**

```python
app = graph.compile(
    checkpointer=memory,
    interrupt_before=["approval"],  # Pause before this node
)
```

#### **4. State Inspection and Modification**

```python
# Get current state
current_state = app.get_state(config)

# Update state with human input
app.update_state(config, {"approved": False, "feedback": "Make it better"})

# Resume execution
result = app.invoke(None, config)
```

## 📊 Graph Visualizations

Each demo generates visual representations of the workflow:

- **Mermaid Diagrams**: Text-based graph representations
- **PNG Exports**: High-quality visual diagrams
- **Real-time Tracking**: Visual feedback during execution

Generated files:

- `graph_code.png` - Self-correcting code generator workflow
- `graph_research.png` - Iterative research workflow
- Additional graphs for each demo

## 🎓 Learning Outcomes

After working through this project, you'll understand:

- ✅ **Self-Correction Patterns**: Building systems that learn from errors
- ✅ **Iterative Workflows**: Multi-step processes with refinement cycles
- ✅ **Human-AI Collaboration**: Effective human-in-the-loop patterns
- ✅ **State Management**: Complex state tracking and persistence
- ✅ **Conditional Logic**: Smart routing and decision-making
- ✅ **Checkpoint Systems**: Pause/resume capabilities
- ✅ **Error Handling**: Robust error detection and recovery
- ✅ **Graph Visualization**: Understanding and debugging complex workflows

## 🚀 Quick Start

### **Prerequisites**

- Python 3.12+
- UV package manager (recommended) or pip
- OpenAI API key
- LangGraph and LangChain dependencies
- Basic understanding of graph concepts

**Installing UV (if not already installed):**

```bash
# Install UV (recommended way)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or with pip (alternative)
pip install uv
```

### **Installation**

```bash
# Install dependencies with uv
uv sync

# Or install manually
uv add langchain langgraph python-dotenv
```

### **Environment Setup**

```bash
# Create .env file
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

### **Running the Demos**

```bash
# Run all demos with uv
uv run python main.py

# Run individual demos with uv
uv run python -c "from main import demo_self_correcting_code; demo_self_correcting_code()"
uv run python -c "from main import demo_iterative_research; demo_iterative_research()"
uv run python -c "from main import demo_interrupt_for_approval; demo_interrupt_for_approval()"
uv run python -c "from main import demo_iterative_review; demo_iterative_review()"

# Alternative: Activate virtual environment and run normally
uv shell
python main.py
```

## 🔧 Advanced Features

### **Memory Management**

- **Persistent State**: State survives across interruptions
- **Thread Safety**: Multiple concurrent workflows
- **State History**: Complete audit trail of state changes

### **Error Recovery**

- **Graceful Degradation**: Continue despite partial failures
- **Rollback Capability**: Return to previous valid states
- **Diagnostic Information**: Detailed error reporting

### **Performance Optimization**

- **Lazy Evaluation**: Compute only when needed
- **State Caching**: Avoid redundant computations
- **Parallel Processing**: Concurrent node execution where possible

## 🎯 Use Cases

These patterns are applicable to:

- **Code Generation**: Automated programming assistants
- **Research Automation**: AI-powered research workflows
- **Content Creation**: Iterative writing and editing processes
- **Quality Assurance**: Automated testing and validation
- **Decision Support**: Human-AI collaborative decision-making
- **Workflow Automation**: Complex business process automation

## 📚 Related Concepts

- **Finite State Machines**: Theoretical foundation
- **Workflow Engines**: Business process management
- **Agent Architectures**: Multi-agent systems
- **Reinforcement Learning**: Learning from feedback
- **Human-Computer Interaction**: Collaborative interfaces

## 🤝 Contributing

This project serves as a reference implementation for advanced LangGraph patterns. Feel free to adapt these patterns for your specific use cases and contribute improvements.

## 📄 License

This project is educational and demonstrates advanced LangGraph capabilities for learning and reference purposes.

---

**Built with LangGraph** - Advanced workflow orchestration for AI applications.