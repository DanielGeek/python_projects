# 🦜 LangChain V.1: Advanced Chain Patterns

A deep dive into essential LangChain Expression Language (LCEL) patterns for building robust, modular, and debuggable AI applications.

## 📋 Overview

This project provides hands-on demonstrations of key chain composition patterns in LangChain, including:
- **Parallel Execution**: Running multiple chains simultaneously.
- **Passthrough & Assignment**: Managing and enriching data flow.
- **Conditional Branching**: Routing logic based on input.
- **Debugging Techniques**: Inspecting and troubleshooting chains.

## 🎯 Key Patterns Demonstrated

### 1. **Basic Chain (`demo_basic_chain`)**
- **Concept**: The fundamental building block of LCEL.
- **Implementation**: `prompt | model | parser`
- **Use Case**: Simple, single-purpose tasks like summarization or translation.

### 2. **Parallel Chains (`demo_parallel_chain`)**
- **Concept**: Run multiple independent chains on the same input, returning a combined dictionary of results.
- **Implementation**: `RunnableParallel`
- **Use Case**: Performing multiple analyses (e.g., summarization, keyword extraction, sentiment analysis) in a single pass for efficiency.

### 3. **Passthrough & Assignment (`demo_passthrough_chain`)**
- **Concept**: Pass input data through a chain while adding new keys, often from a retrieval step.
- **Implementation**: `RunnablePassthrough` and `RunnableParallel`
- **Use Case**: Building RAG (Retrieval-Augmented Generation) chains where original input and retrieved context are needed by the final prompt.

### 4. **Conditional Branching (`demo_chain_branching`)**
- **Concept**: Dynamically route input to different chains based on a condition.
- **Implementation**: `RunnableBranch`
- **Use Case**: Creating specialized assistants that use different prompts or tools based on the user's intent (e.g., a coding question vs. a general question).

### 5. **Debugging Techniques (`demo_debbuging`)**
- **Concept**: Tools and methods for inspecting and troubleshooting LCEL chains.
- **Methods**:
    - **Schema Inspection**: `chain.input_schema` and `chain.output_schema` to verify data structures.
    - **Tracing with `with_config`**: Assigning a `run_name` for clear identification in LangSmith.
    - **Intermediate Step Logging**: Using `RunnableLambda` to print the output of any step in the chain.

## 🚀 Quick Start

### Prerequisites
- Python 3.14+
- OpenAI API key

### Installation

1. **Clone the repository**

2. **Install dependencies using uv**
```bash
uv sync
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your API key:
```bash
OPENAI_API_KEY=your-openai-api-key
```

### Running the Demos

```bash
uv run python main.py
```

Edit `main.py` to comment/uncomment the demo functions you wish to run.

## 🛠️ Technical Implementation

### Parallel Chain Example

```python
analysis_chain = RunnableParallel(
    summary=summarize_prompt | model | StrOutputParser(),
    keywords=keywords_prompt | model | StrOutputParser(),
    sentiment=sentiment_prompt | model | StrOutputParser(),
)

results = analysis_chain.invoke({"text": "..."})
# returns {'summary': '...', 'keywords': '...', 'sentiment': '...'}
```

### Branching Logic Example

```python
branch = RunnableBranch(
    (is_code_question, code_prompt | model | StrOutputParser()),
    general_prompt | model | StrOutputParser(),  # Default branch
)

result = branch.invoke({"input": "How to write a for loop?"})
# Invokes the code_prompt chain
```

### Debugging with `RunnableLambda`

```python
def log_step(x, step_name=""):
    print(f"[{step_name}] {type(x).__name__}: {str(x)[:100]}")
    return x

debug_chain = (
    prompt
    | RunnableLambda(lambda x: log_step(x, "after_prompt"))
    | model
    | RunnableLambda(lambda x: log_step(x, "after_model"))
    | StrOutputParser()
)
```

## 📦 Dependencies

- `langchain`
- `langchain-openai`
- `python-dotenv`

## 🎓 Learning Outcomes

- ✅ Master fundamental and advanced LCEL chain patterns.
- ✅ Build modular, reusable, and efficient AI workflows.
- ✅ Implement conditional logic and parallel processing in chains.
- ✅ Effectively debug and trace LCEL chains for production readiness.