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

## 📦 Installation

```bash
cd 35-langgraph-sidekick

# Install dependencies
uv sync

# Install Playwright browsers
playwright install chromium
```

## 🔧 Configuration

Create a `.env` file based on `.env.example`:

```env
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional - for push notifications
PUSHOVER_TOKEN=your_pushover_token_here
PUSHOVER_USER=your_pushover_user_key_here

# Optional - for web search
SERPER_API_KEY=your_serper_api_key_here
```

## 🚀 Running the Application

### Option 1: Simple Version (main.py)
```bash
uv run main.py
```
- Single file implementation
- Basic multi-agent system
- Good for understanding the core concepts

### Option 2: Advanced Version (app.py) ⭐ Recommended
```bash
uv run app.py
```
- Modular architecture with separate files
- Full tool suite (Playwright, Pushover, Wikipedia, Python REPL, File Management, Web Search)
- Better resource management
- Production-ready structure

## 🛠️ Available Tools

The advanced version (`app.py`) includes:

1. **Playwright Tools** - Web scraping and browser automation
   - Navigate to URLs
   - Extract text content
   - Click elements
   - Fill forms

2. **Push Notifications** - Send alerts via Pushover
   - `send_push_notification(text)` - Send notification to your device

3. **Web Search** - Google search via Serper API
   - `search(query)` - Get search results

4. **Wikipedia** - Query Wikipedia articles
   - Automatic article lookup and summarization

5. **Python REPL** - Execute Python code
   - Run calculations
   - Data processing
   - Quick scripts

6. **File Management** - Read/write files in sandbox
   - Create files
   - Read file contents
   - List directory contents

## 💡 Usage Examples

### Example 1: Simple Web Research (main.py)

```
Request: "Get me the main headline from CNN"
Success Criteria: "Response contains the current headline text from CNN.com"
```

*Perfect for testing the basic multi-agent system with just Playwright tools.*

### Example 2: Data Analysis
```
Request: "Calculate the average of these numbers: 45, 67, 89, 23, 56"
Success Criteria: "Response includes the calculated average"
```

### Example 3: Wikipedia Research
```
Request: "Tell me about Python programming language from Wikipedia"
Success Criteria: "Response includes key information about Python from Wikipedia"
```

### Example 4: File Operations
```
Request: "Create a file called notes.txt with today's date and a reminder"
Success Criteria: "File is created in sandbox with the requested content"
```

### Example 5: Web Search + File Writing + Notification (app.py - Advanced)
```
Request: "I'd like to go for dinner tomorrow in a French restaurant in NYC. Please find a great French restaurant and write a report in markdown to dinner.md including the name, address, menu, reviews. Send me a push notification with the restaurant name and phone"
Success Criteria: "dinner.md file created with complete restaurant information and push notification sent"
```

**What happens:**

1. **Web Search**: Uses Serper API to find French restaurants in NYC
2. **Web Scraping**: Uses Playwright to extract detailed information (menu, reviews)
3. **File Management**: Creates `dinner.md` in sandbox with structured markdown
4. **Push Notification**: Sends restaurant name and phone via Pushover
5. **Evaluator**: Verifies file exists and notification was sent

## 🔄 How It Works

1. **Worker Agent** receives your request and success criteria
2. **Worker** uses available tools to complete the task
3. **Evaluator Agent** reviews the worker's output
4. **Feedback Loop**: If criteria not met, evaluator provides feedback and worker tries again
5. **Completion**: Process ends when criteria are satisfied or user input is needed

## 📊 UI Features

- **Request Field**: Enter your task
- **Success Criteria Field**: Define what success looks like
- **Go Button**: Start the multi-agent workflow
- **Reset Button**: Clear conversation and start fresh
- **Chat Display**: See worker responses and evaluator feedback

## 🎯 Tips for Best Results

1. **Be Specific**: Clear success criteria lead to better results
   - ❌ Bad: "Get some news"
   - ✅ Good: "Get the top 3 headlines from CNN with brief summaries"

2. **Make Criteria Measurable**: Evaluator needs clear metrics
   - ❌ Bad: "Good summary"
   - ✅ Good: "Summary contains at least 3 key points"

3. **Use Available Tools**: Worker has many capabilities
   - Web scraping (Playwright)
   - Calculations (Python REPL)
   - Research (Wikipedia + Web Search)
   - Notifications (Pushover)
   - File operations

4. **Iterate**: If first attempt doesn't meet criteria, evaluator will guide improvements

## 🐛 Troubleshooting

### Browser Not Opening
```bash
playwright install chromium
```

### Missing Dependencies
```bash
uv sync
```

### API Keys Not Working
- Check `.env` file exists
- Verify API keys are correct
- Ensure no extra spaces in `.env`

### Gradio Warnings
The warnings about `theme` and `type` parameters are cosmetic and don't affect functionality.

## 📝 File Structure

```
35-langgraph-sidekick/
├── main.py              # Simple version (single file)
├── app.py               # Advanced version (entry point)
├── sidekick.py          # Sidekick class with multi-agent logic
├── sidekick_tools.py    # All tool definitions
├── pyproject.toml       # Dependencies
├── .env.example         # Environment variables template
└── README.md            # This file
```

## 🎓 Learning Resources

- **LangGraph**: https://langchain-ai.github.io/langgraph/
- **Playwright**: https://playwright.dev/python/
- **Pydantic**: https://docs.pydantic.dev/

---

**Note**: This is an educational project demonstrating multi-agent AI systems with quality assurance patterns.