# 🦜 LangChain Fundamentals - Complete Learning Guide

A comprehensive hands-on guide to mastering LangChain V.1 fundamentals, covering LCEL, prompts, output parsers, and multi-model integration.

## 🎯 Project Overview

**Project:** LangChain Fundamentals - From Basics to Advanced Patterns  
**Technologies:** LangChain, OpenAI, Anthropic, Python 3.14+  
**Status:** Complete ✅  
**Last Updated:** March 2026  
**Version:** 0.1.0

## 🚀 What This Project Demonstrates

This project provides a complete learning path for LangChain fundamentals:

- **🔗 LCEL (LangChain Expression Language)**: Chain composition with pipe operators
- **💬 Multi-Model Support**: OpenAI GPT-4o, GPT-4o-mini, Claude Sonnet
- **📝 Prompt Engineering**: Templates, few-shot learning, message placeholders
- **🎯 Output Parsing**: String, JSON, Pydantic, and structured output
- **⚡ Streaming & Batching**: Real-time responses and batch processing
- **🧩 Modular Architecture**: Reusable components and chain composition

## 📚 Learning Modules

### 1. Core Concepts (`core_concepts.py`)

**LCEL Fundamentals:**
- Basic chain composition with `|` operator
- Batch execution for multiple inputs
- Streaming for real-time output
- Schema inspection for debugging

**Key Concepts:**
```python
# Basic LCEL chain
prompt = ChatPromptTemplate.from_template("Answer: {question}")
model = ChatOpenAI(model="gpt-4o-mini")
parser = StrOutputParser()

chain = prompt | model | parser
result = chain.invoke({"question": "What is LangChain?"})
```

**Features Demonstrated:**
- ✅ Chain composition with pipe operators
- ✅ Batch processing with `chain.batch()`
- ✅ Real-time streaming with `chain.stream()`
- ✅ Input/output schema inspection
- ✅ Practical exercises with solutions

---

### 2. Working with LLMs (`working_with_llms.py`)

**Multi-Provider Integration:**
- Universal model initialization with `init_chat_model()`
- Provider-specific configurations
- Model comparison across providers
- Multi-turn conversations

**Supported Models:**
- **OpenAI**: GPT-4o, GPT-4o-mini
- **Anthropic**: Claude Sonnet 4.5

**Key Features:**
```python
# Universal initialization
model = init_chat_model(
    model="gpt-4o-mini",
    temperature=0.7,
    streaming=True,
    max_retries=3
)

# Easy provider switching
claude = init_chat_model(
    model="claude-sonnet-4-5-20250929",
    model_provider="anthropic"
)
```

**Advanced Configurations:**
- ✅ Temperature control for creativity
- ✅ Max tokens for output length
- ✅ Timeout and retry mechanisms
- ✅ Streaming capabilities
- ✅ Message-based conversations

---

### 3. Prompt Templates (`prompt_templates_all.py`)

**Template Types:**
- Simple string templates
- Multi-message templates
- Few-shot prompting
- Message placeholders for conversation history
- Prompt composition and reusability

**Examples:**

**Basic Template:**
```python
prompt = ChatPromptTemplate.from_template(
    "Translate '{text}' to {language}"
)
```

**Multi-Message Template:**
```python
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful translator."),
    ("human", "Translate '{text}' to {language}")
])
```

**Few-Shot Learning:**
```python
examples = [
    {"word": "happy", "opposite": "sad"},
    {"word": "fast", "opposite": "slow"}
]

few_shot = FewShotChatMessagePromptTemplate(
    example_prompt=example_prompt,
    examples=examples
)
```

**Message Placeholder:**
```python
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant."),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{question}")
])
```

**Features:**
- ✅ Dynamic variable substitution
- ✅ Conversation history management
- ✅ Few-shot learning patterns
- ✅ Reusable prompt components
- ✅ Persona and tone customization

---

### 4. Output Parsers (`output_parsers_final.py`)

**Parser Types:**
- **StrOutputParser**: Simple string output
- **JsonOutputParser**: Structured JSON data
- **PydanticOutputParser**: Type-safe schemas
- **Structured Output**: Modern `with_structured_output()`

**Examples:**

**String Parser:**
```python
parser = StrOutputParser()
chain = prompt | model | parser
result = chain.invoke({})  # Returns: str
```

**JSON Parser:**
```python
parser = JsonOutputParser()
chain = prompt | model | parser
result = chain.invoke({"place": "Paris"})
# Returns: {"city": "Paris", "country": "France"}
```

**Pydantic Parser (Type-Safe):**
```python
class Recipe(BaseModel):
    name: str = Field(description="Recipe name")
    ingredients: List[str]
    prep_time_minutes: int
    difficulty: str

parser = PydanticOutputParser(pydantic_object=Recipe)
chain = prompt | model | parser
result = chain.invoke({"dish": "pasta"})
# Returns: Recipe object with type checking
```

**Structured Output (Modern):**
```python
class TaskExtraction(BaseModel):
    task: str
    priority: str
    deadline: Optional[str]
    assignee: Optional[str]

structured_model = model.with_structured_output(TaskExtraction)
chain = prompt | structured_model
result = chain.invoke({"text": "John needs to finish report by Friday"})
# Returns: TaskExtraction object
```

**Features:**
- ✅ Type-safe data extraction
- ✅ Automatic validation with Pydantic
- ✅ Nested schema support
- ✅ Optional fields handling
- ✅ Complex data structures

---

### 5. Setup & Configuration (`main.py`)

**Environment Setup:**
- Version detection for LangChain packages
- Multi-provider API key management
- Basic model testing

**Configuration:**
```python
# .env file
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.14+
- OpenAI API key
- Anthropic API key (optional)
- uv package manager (recommended)

### Installation

```bash
# Clone the repository
cd 48-langchain-example

# Install dependencies with uv
uv sync

# Or with pip
pip install -r requirements.txt
```

### Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Add your API keys to `.env`:
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 🚀 Running the Examples

### Test Setup
```bash
uv run python main.py
```

### Core Concepts
```bash
# Run all demos
uv run python core_concepts.py

# Or run specific demos by uncommenting in __main__
```

### Working with LLMs
```bash
uv run python working_with_llms.py
```

### Prompt Templates
```bash
uv run python prompt_templates_all.py
```

### Output Parsers
```bash
uv run python output_parsers_final.py
```

---

## 📦 Dependencies

```toml
[project]
dependencies = [
    "langchain>=1.2.12",
    "langchain-anthropic>=1.3.5",
    "langchain-core>=1.2.19",
    "langchain-openai>=1.1.11",
    "langgraph>=1.1.2",
    "python-dotenv>=1.2.2",
]
```

---

## 🎓 Learning Path

### Beginner
1. Start with `main.py` - Test your setup
2. Explore `core_concepts.py` - Learn LCEL basics
3. Practice `working_with_llms.py` - Understand model configuration

### Intermediate
4. Study `prompt_templates_all.py` - Master prompt engineering
5. Learn `output_parsers_final.py` - Type-safe data extraction

### Advanced
6. Combine concepts to build custom chains
7. Experiment with different models and configurations
8. Build production-ready applications

---

## 💡 Key Concepts Explained

### LCEL (LangChain Expression Language)
- **Pipe Operator (`|`)**: Chain components together
- **Runnables**: All components implement Runnable interface
- **Composability**: Build complex chains from simple parts

### Chain Execution Methods
- **`invoke()`**: Single input, single output
- **`batch()`**: Multiple inputs, multiple outputs
- **`stream()`**: Real-time streaming output
- **`ainvoke()`**: Async single execution
- **`abatch()`**: Async batch execution

### Message Types
- **SystemMessage**: System instructions
- **HumanMessage**: User input
- **AIMessage**: Model response
- **ToolMessage**: Tool execution results
- **ChatMessage**: Generic chat message

### Output Parsing Strategies
- **String**: Simple text output
- **JSON**: Structured data without validation
- **Pydantic**: Type-safe with validation
- **Structured Output**: Modern approach with automatic schema binding

---

## 🔧 Advanced Features

### Model Configuration
```python
model = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.7,        # Creativity (0-1)
    max_tokens=1500,        # Max output tokens
    timeout=30,             # Request timeout
    max_retries=3           # Retry on failure
)
```

### Conversation History
```python
messages = [
    SystemMessage(content="You are a helpful assistant."),
    HumanMessage(content="Hello!"),
    AIMessage(content="Hi! How can I help?"),
    HumanMessage(content="What's my name?")
]
response = model.invoke(messages)
```

### Prompt Composition
```python
# Reusable components
persona = ChatPromptTemplate.from_messages([
    ("system", "You are a {role}.")
])

task = ChatPromptTemplate.from_messages([
    ("human", "{task}")
])

# Combine
full_prompt = persona + task
```

---

## 🎯 Practical Exercises

Each module includes hands-on exercises:

1. **Core Concepts**: Build a marketing tagline generator
2. **Working with LLMs**: Multi-model response comparison
3. **Prompt Templates**: Create custom conversation flows
4. **Output Parsers**: Extract structured data from text

---

## 🚀 Next Steps

After mastering these fundamentals, explore:

- **LangGraph**: Build stateful, multi-agent applications
- **RAG (Retrieval-Augmented Generation)**: Document Q&A systems
- **Agents**: Autonomous task execution with tools
- **Memory**: Conversation persistence and context management
- **Vector Stores**: Semantic search and embeddings

---

## 📝 Best Practices

### Code Organization
- ✅ Separate concerns (prompts, models, parsers)
- ✅ Use type hints for better IDE support
- ✅ Implement error handling
- ✅ Add docstrings to functions

### Performance
- ✅ Use streaming for long responses
- ✅ Batch similar requests
- ✅ Cache expensive operations
- ✅ Set appropriate timeouts

### Security
- ✅ Never hardcode API keys
- ✅ Use environment variables
- ✅ Validate user inputs
- ✅ Sanitize outputs

---

## 🤝 Contributing

This is a learning project. Feel free to:
- Add new examples
- Improve documentation
- Fix bugs
- Share your learnings

---

## 📄 License

MIT License - Feel free to use this code for learning and projects.

---

## 🙏 Acknowledgments

- **LangChain Team**: For the amazing framework
- **OpenAI**: For GPT models
- **Anthropic**: For Claude models
- **Community**: For continuous learning and sharing

---

## 📚 Additional Resources

- [LangChain Documentation](https://python.langchain.com/)
- [LangChain Expression Language (LCEL)](https://python.langchain.com/docs/expression_language/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Anthropic Claude Documentation](https://docs.anthropic.com/)

---

**Happy Learning! 🚀**
