# LangGraph Tool-Calling Agents - Building Intelligent Tool-Using Systems

A comprehensive exploration of LangGraph's tool-calling capabilities, demonstrating how to build intelligent agents that can interact with external tools, handle errors gracefully, and execute complex multi-step workflows.

## 🎯 Overview

This project dives deep into LangGraph's tool-calling system, showing how to create agents that can use external tools, manage tool execution flows, handle errors, and provide detailed execution traces for debugging and analysis.

## 🚀 Key Features

### **1. Tool Creation and Integration**

- **Custom Tool Development**: Create Python functions as LangGraph tools
- **Tool Binding**: Connect tools to LLM using `bind_tools()` method
- **Tool Discovery**: Automatic tool selection by the LLM based on user queries
- **Parameter Validation**: Built-in type checking and parameter validation

### **2. Multi-Tool Workflows**
- **Parallel Tool Execution**: Multiple tools can be called in a single query
- **Sequential Processing**: Chain multiple tool calls for complex tasks
- **Context Preservation**: Maintain conversation context across tool executions
- **Dynamic Tool Selection**: LLM chooses appropriate tools based on query analysis

### **3. Advanced Error Handling**
- **Graceful Error Recovery**: Handle tool failures without breaking the workflow
- **Error Propagation**: Pass error messages back to the LLM for intelligent handling
- **Fallback Mechanisms**: Alternative strategies when tools fail
- **User-Friendly Error Messages**: Convert technical errors to understandable responses

### **4. Execution Tracing and Debugging**
- **Detailed Message Flow**: Complete visibility into agent-tool interactions
- **Tool Call Tracking**: Monitor which tools are called and their arguments
- **Response Analysis**: Understand how LLM processes tool results
- **Performance Monitoring**: Track execution time and tool usage patterns

### **5. State Management**
- **Message Accumulation**: Complete history of human-AI-tool interactions
- **State Evolution**: Track how agent state changes through the workflow
- **Context Preservation**: Maintain conversation context across multiple tool calls
- **Memory Management**: Efficient handling of long conversations with multiple tool interactions

## 🏗️ Architecture

### **Core Components**

#### **Tool Definition**

```python
@tool
def calculate(expression: str) -> str:
    """Calculate a mathematical expression. Example: calculate('2 + 2')"""
    try:
        result = eval(expression)
        return f"The result of {expression} is {result}"
    except Exception as e:
        return f"Error: calculating: {e}"
```

#### **Agent State Management**

```python
class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
```

#### **Tool-Calling Logic**

```python
def should_continue(state: AgentState) -> Literal["tools", "end"]:
    """Check if we should continue to tools or end."""
    last_message = state["messages"][-1]
    
    if not hasattr(last_message, "tool_calls") or not last_message.tool_calls:
        return "end"
    return "tools"
```

### **Graph Structure**

```text
START → [agent] → Conditional Edge → [tools] → [agent] → END
                              ↓
                            END
```

### **Message Flow**
1. **HumanMessage**: User input/query
2. **AIMessage**: LLM response with tool calls
3. **ToolMessage**: Tool execution results
4. **AIMessage**: LLM analysis of tool results
5. **Final Response**: Processed answer to user

## 📋 Demonstrations

### **Demo 1: Basic Tool-Calling Agent**

```python
# Create agent with multiple tools
tools = [calculate, get_weather, search_web]
agent = create_tool_agent()

# Test queries
queries = [
    "What's 25 * 17?",                    # Single tool call
    "What's the weather in Tokyo?",       # Weather tool
    "What's 100 / 4 and weather in London?" # Multiple tools
]
```

**Features:**

- Automatic tool selection based on query content
- Parallel tool execution for complex queries
- Natural language integration with tool results
- Context-aware response generation

### **Demo 2: Tool Execution Trace**

```python
# Detailed execution analysis
result = agent.invoke({
    "messages": [HumanMessage(content="Calculate 15% of 250 and check weather in Paris")]
})

# Analyze message flow
for i, msg in enumerate(result["messages"]):
    msg_type = type(msg).__name__
    if isinstance(msg, AIMessage) and msg.tool_calls:
        print(f"Tool calls: {len(msg.tool_calls)}")
        for tc in msg.tool_calls:
            print(f"  - {tc['name']}({tc['args']})")
```

**Features:**

- Complete visibility into tool execution flow
- Detailed argument tracking for each tool call
- Step-by-step analysis of agent reasoning
- Performance monitoring and debugging capabilities

### **Demo 3: Error Handling and Recovery**

```python
@tool
def divide(a: float, b: float) -> str:
    """Divide two numbers."""
    if b == 0:
        return "Error: Division by zero"
    result = a / b
    return f"The result of {a} divide by {b} is {result}"

# Test with error cases
queries = [
    "Divide 100 by 5",    # Normal case
    "Divide 100 by 0",    # Error case
]
```

**Features:**

- Graceful error handling within tool functions
- Error message propagation to LLM
- Intelligent error recovery and user communication
- Robust workflow continuation despite tool failures

## 🛠️ Technical Implementation

### **Dependencies**

```python
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage, BaseMessage
from typing_extensions import TypedDict, Annotated
from langgraph.graph.message import add_messages
from typing import Literal
```

### **Key Patterns**

#### **1. Tool Creation**

```python
@tool
def function_name(param: type) -> str:
    """Tool description for LLM."""
    # Implementation
    return "result"
```

#### **2. Tool Binding**

```python
tools = [tool1, tool2, tool3]
llm_with_tools = llm.bind_tools(tools)
```

#### **3. Conditional Routing**

```python
def should_continue(state: AgentState) -> Literal["tools", "end"]:
    last_message = state["messages"][-1]
    if not hasattr(last_message, "tool_calls") or not last_message.tool_calls:
        return "end"
    return "tools"
```

#### **4. Graph Construction**

```python
graph = StateGraph(AgentState)
graph.add_node("agent", agent_node)
graph.add_node("tools", tool_node)
graph.add_edge(START, "agent")
graph.add_conditional_edges("agent", should_continue, {"tools": "tools", "end": END})
graph.add_edge("tools", "agent")
```

## 📊 Tool Types and Examples

### **Mathematical Tools**
- **calculate**: Evaluate mathematical expressions
- **divide**: Safe division with error handling
- **percentage**: Calculate percentages and ratios

### **Information Tools**

- **get_weather**: Retrieve weather information for cities
- **search_web**: Simulate web search functionality
- **get_time**: Current time and timezone information

### **Data Processing Tools**

- **format_text**: Text formatting and manipulation
- **parse_data**: Extract structured information from text
- **validate_input**: Input validation and sanitization

## 🔄 Message Flow Analysis

### **Typical Execution Pattern**

```text
1. HumanMessage: "What's 25 * 17?"
2. AIMessage: Tool calls=[calculate(expression="25 * 17")]
3. ToolMessage: "The result of 25 * 17 is 425"
4. AIMessage: "25 multiplied by 17 equals 425."
```

### **Multi-Tool Execution**

```text
1. HumanMessage: "What's 100 / 4 and weather in London?"
2. AIMessage: Tool calls=[
     calculate(expression="100 / 4"),
     get_weather(city="London")
   ]
3. ToolMessage: "The result of 100 / 4 is 25"
4. ToolMessage: "Weather in London: 58°F, Cloudy"
5. AIMessage: "100 divided by 4 equals 25, and the weather in London is 58°F and cloudy."
```

## 🎓 Learning Outcomes

After working through this project, you'll understand:

- ✅ **Tool Creation**: How to create and customize LangGraph tools
- ✅ **Tool Integration**: Binding tools to LLMs and managing tool calls
- ✅ **Workflow Orchestration**: Building multi-step tool-using workflows
- ✅ **Error Handling**: Graceful error recovery and user communication
- ✅ **Execution Tracing**: Debugging and monitoring tool interactions
- ✅ **State Management**: Managing conversation context with tools
- ✅ **Performance Optimization**: Efficient tool usage and caching strategies
- ✅ **Production Patterns**: Building robust, scalable tool-using agents

## 🚀 Quick Start

### **Prerequisites**

- Python 3.12+
- UV package manager (recommended) or pip
- OpenAI API key
- Basic understanding of LangGraph concepts

### **Installation**

```bash
# Clone and navigate to project
cd 63-langgraph-tools

# Install dependencies with uv
uv sync

# Or install manually
uv add langchain langchain-openai python-dotenv
```

### **Environment Setup**

```bash
# Create .env file
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

### **Running the Demos**

```bash
# Run basic tool agent demo
uv run python main.py  # demo_tool_with_errors() is default

# Edit main.py to run different demos:
# - demo_tool_agent()
# - demo_tool_execution_trace()
# - demo_tool_with_errors()
```

## 🔧 Advanced Features

### **Custom Tool Development**

- **Parameter Validation**: Advanced type checking and validation
- **Async Tools**: Asynchronous tool execution for better performance
- **Tool Composition**: Combining multiple tools into complex workflows
- **Dynamic Tool Loading**: Runtime tool registration and discovery

### **Error Handling Strategies**

- **Retry Mechanisms**: Automatic retry with exponential backoff
- **Fallback Tools**: Alternative tools when primary tools fail
- **Error Categorization**: Different handling for different error types
- **User Notification**: Clear error communication and resolution suggestions

### **Performance Optimization**

- **Tool Caching**: Cache frequently used tool results
- **Parallel Execution**: Run multiple tools concurrently when possible
- **Connection Pooling**: Efficient resource management for external APIs
- **Memory Management**: Optimize memory usage for long-running conversations

### **Security Considerations**

- **Input Sanitization**: Prevent injection attacks in tool parameters
- **Access Control**: Restrict tool usage based on user permissions
- **Audit Logging**: Complete audit trail of tool usage
- **Rate Limiting**: Prevent abuse of external tool integrations

## 🎯 Use Cases

These patterns are applicable to:

- **Data Analysis Agents**: Tools for data processing and visualization
- **Research Assistants**: Web search, document analysis, and information synthesis
- **Customer Support**: Integration with CRM, ticketing, and knowledge base systems
- **Financial Advisors**: Market data, portfolio analysis, and calculation tools
- **Development Assistants**: Code execution, testing, and deployment tools
- **Personal Assistants**: Calendar, email, and productivity tool integration

## 📚 Related Concepts

- **Function Calling**: OpenAI's function calling capabilities
- **Tool Use Patterns**: Common patterns for tool integration
- **Agent Architectures**: Different approaches to building tool-using agents
- **Workflow Orchestration**: Managing complex multi-step processes
- **API Integration**: Connecting agents to external services and APIs

## 🤝 Contributing

This project serves as a comprehensive reference for LangGraph tool-calling. Feel free to adapt these patterns for your specific use cases and contribute improvements.

## 📄 License

This project is educational and demonstrates advanced LangGraph tool-calling capabilities for learning and reference purposes.

---

**Built with LangGraph** - Intelligent tool-using agents for complex workflow automation.