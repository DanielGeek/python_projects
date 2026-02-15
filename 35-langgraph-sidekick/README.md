# LangGraph Sidekick - Multi-Agent Personal Co-worker

An intelligent multi-agent system that combines a Worker agent with an Evaluator agent to complete tasks with quality assurance. The system uses structured outputs and continuous feedback loops to ensure success criteria are met.

## 🚀 Features

- **Multi-Agent Architecture**: Worker agent executes tasks, Evaluator agent ensures quality
- **Structured Outputs**: Pydantic models for reliable agent communication
- **Success Criteria Tracking**: Define and validate completion criteria
- **Feedback Loop**: Continuous improvement through evaluator feedback
- **Playwright Integration**: Web scraping capabilities with anti-bot bypass
- **Interactive UI**: Gradio interface with success criteria input
- **Persistent Memory**: Thread-based conversation history

## 🛠️ How It Works

### Multi-Agent Flow

1. **Worker Agent**: Receives task and success criteria, uses tools to complete the assignment
2. **Tool Execution**: Worker can use Playwright to scrape websites
3. **Evaluator Agent**: Reviews worker's output against success criteria
4. **Feedback Loop**: If criteria not met, evaluator provides feedback and worker tries again
5. **Completion**: Process ends when criteria are met or user input is needed

### Structured Outputs

The Evaluator uses Pydantic models for reliable decision-making:

```python
class EvaluatorOutput(BaseModel):
    feedback: str
    success_criteria_met: bool
    user_input_needed: bool
```

## 📦 Installation

```bash
# Navigate to project directory
cd python_projects/35-langgraph-sidekick

# Install dependencies
uv sync

# Install Playwright browsers
playwright install chromium

# Run the application
uv run main.py
```

## 🔧 Configuration

Create a `.env` file with:

```env
# OpenAI API Key (required)
OPENAI_API_KEY=your_openai_key_here
```

## 🎯 Usage Examples

### Example 1: Web Research Task

**Your Request:**
```
Get me the main headline from CNN
```

**Success Criteria:**
```
The response should contain the current main headline text from CNN.com
```

**What Happens:**
1. Worker agent uses Playwright to scrape CNN
2. Extracts the headline text
3. Evaluator checks if headline is present
4. Returns result with feedback

### Example 2: Iterative Improvement

**Your Request:**
```
Summarize the top 3 stories from BBC News
```

**Success Criteria:**
```
Response must include exactly 3 story summaries with titles
```

**What Happens:**
1. Worker scrapes BBC News
2. Attempts to provide summaries
3. Evaluator checks if exactly 3 summaries are present
4. If not, provides feedback and worker tries again
5. Loop continues until criteria met

## 🏗️ Architecture

```text
┌──────────────┐
│    START     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Worker     │◄─────┐
│   Agent      │      │
└──────┬───────┘      │
       │              │
       ▼              │
  ┌────────┐          │
  │ Tools? │──Yes──►┌─┴────────┐
  └───┬────┘        │ Playwright│
      │             │   Tools   │
      No            └───────────┘
      │                    │
      ▼                    │
┌──────────────┐          │
│  Evaluator   │          │
│   Agent      │◄─────────┘
└──────┬───────┘
       │
  ┌────┴─────┐
  │ Success? │
  └────┬─────┘
       │
    ┌──┴──┐
    │ Yes │──► END
    └─────┘
       │
      No
       │
    (Loop back to Worker)
```

## 🔍 Key Components

### 1. Worker Agent

```python
def worker(state: State) -> Dict[str, Any]:
    """
    - Receives task and success criteria
    - Uses tools to complete assignment
    - Can ask clarifying questions
    - Returns response for evaluation
    """
```

### 2. Evaluator Agent

```python
def evaluator(state: State) -> State:
    """
    - Reviews worker's response
    - Checks against success criteria
    - Provides structured feedback
    - Decides: continue, end, or need user input
    """
```

### 3. Structured Output

```python
class EvaluatorOutput(BaseModel):
    feedback: str  # What needs improvement
    success_criteria_met: bool  # Task complete?
    user_input_needed: bool  # Need clarification?
```

## 🎮 Running the Application

```bash
# Start the Sidekick
uv run main.py

# Open browser to
http://127.0.0.1:7860
```

## 📊 How to Use the UI

1. **Enter your request** in the first text box (e.g., "Get CNN headline")
2. **Define success criteria** in the second text box (e.g., "Response contains headline text")
3. **Click "Go!"** to start the multi-agent workflow
4. **View the conversation** showing:
   - Your request
   - Worker's response
   - Evaluator's feedback
5. **Reset** to start a new task

## � Workflow Benefits

- **Quality Assurance**: Evaluator ensures output meets standards
- **Self-Correction**: Worker improves based on feedback
- **Clear Criteria**: Explicit success conditions
- **Transparency**: See both worker output and evaluation
- **Flexibility**: Can handle complex, multi-step tasks

## 🐛 Troubleshooting

### Common Issues

1. **Worker keeps looping**
   - Make success criteria more specific
   - Check if task is actually achievable
   - Evaluator may be too strict

2. **Playwright browser not opening**
   - Run: `playwright install chromium`
   - Check if display server is available

3. **Evaluator always says criteria not met**
   - Simplify success criteria
   - Make criteria measurable and clear

### Debug Mode

Enable detailed logging:

```python
logging.basicConfig(level=logging.DEBUG)
```

## 🎓 Learning Points

This project demonstrates:

- **Multi-agent systems** with specialized roles
- **Structured outputs** using Pydantic
- **Feedback loops** for iterative improvement
- **State management** in LangGraph
- **Conditional routing** based on agent decisions
- **Tool integration** with async operations

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🙏 Acknowledgments

- **LangGraph**: For the multi-agent framework
- **Playwright**: For web scraping capabilities
- **Gradio**: For the interactive UI
- **OpenAI**: For the LLM capabilities
- **Pydantic**: For structured outputs

---

**Note**: This is an educational project demonstrating multi-agent AI systems with quality assurance patterns.