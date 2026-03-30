# LangSmith Example - Production Observability for LLM Applications

A comprehensive demonstration of LangSmith observability and monitoring capabilities for production LLM applications. This project showcases essential tracing, logging, and debugging features that enable developers to monitor, analyze, and optimize their LangChain and LangGraph applications in production environments.

## 🎯 Overview

LangSmith is a unified developer platform for building, testing, and monitoring LLM applications. This project demonstrates how to implement observability best practices including automatic tracing, custom run naming, metadata filtering, and performance monitoring. Learn how to gain complete visibility into your LLM application's behavior, identify bottlenecks, and optimize performance with detailed execution traces.

## 🚀 Key Features

### **1. Automatic Tracing Setup**

- **Environment Configuration**: Simple environment variable setup for LangSmith integration
- **Project Organization**: Organize traces by project for better management
- **Automatic Instrumentation**: Zero-config tracing for LangChain components
- **Real-time Monitoring**: Live dashboard for execution tracking

### **2. Custom Run Naming and Tagging**

- **Descriptive Run Names**: Meaningful names for easier trace identification
- **Tag-based Filtering**: Organize runs with custom tags for better categorization
- **Environment Separation**: Distinguish between development, staging, and production runs
- **Team Collaboration**: Shared naming conventions for better team coordination

### **3. Metadata-Driven Observability**

- **Rich Metadata**: Add contextual information to traces for better analysis
- **Custom Attributes**: Include user IDs, request types, and business metrics
- **Filterable Properties**: Enable advanced filtering and searching capabilities
- **Performance Correlation**: Correlate traces with business metrics and user behavior

### **4. Production-Ready Monitoring**

- **Error Tracking**: Automatic error capture and stack trace analysis
- **Performance Metrics**: Latency, token usage, and cost monitoring
- **Run Comparison**: Compare different runs to identify performance changes
- **Alert Integration**: Set up alerts for performance anomalies and errors

## 🏗️ Architecture

### **LangSmith Integration Flow**

```
┌─────────────────────────────────────────────────────────────┐
│                    LLM APPLICATION                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ LangChain   │  │ LangGraph   │  │ Custom Components   │ │
│  │ Chains      │  │ Graphs      │  │ & Functions         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │ Automatic Tracing
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   LANGSMITH PLATFORM                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Trace       │  │ Dashboard   │  │ Analytics &         │ │
│  │ Collection  │  │ Monitoring  │  │ Reporting           │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Performance │  │ Error       │  │ Cost &              │ │
│  │ Metrics     │  │ Tracking    │  │ Usage Analysis      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### **Core Components**

#### **1. Environment Configuration**
```python
# Enable LangSmith tracing
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = "multi-agent-research-system"
```

#### **2. Automatic Tracing**
```python
@traceable(name="basic_chaining")
def demo_basic_tracing():
    """Automatic tracing for LangChain components."""
    chain = prompt | llm | StrOutputParser()
    result = chain.invoke({"topic": "machine learning"})
```

#### **3. Named Runs with Tags**
```python
@traceable(name="named_runs_demo", tags=["production", "summarization"])
def demo_named_runs():
    """Custom naming and tagging for better organization."""
    # Runs appear with custom name and tags in dashboard
```

#### **4. Metadata-Driven Tracing**
```python
@traceable(name="tracer_with_metadata_demo", tags=["metadata", "filtering"])
def demo_trace_with_metadata(user_id: str, request_type: str):
    """Add metadata for filtering and analysis."""
    # Metadata automatically captured for analysis
```

## 📋 Demonstrations

### **Demo 1: Basic Automatic Tracing**

```python
@traceable(name="basic_chaining")
def demo_basic_tracing():
    """Demonstrates basic LangSmith setup and automatic tracing."""
    
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    prompt = ChatPromptTemplate.from_template("Explain {topic} in one sentence.")
    chain = prompt | llm | StrOutputParser()
    
    result = chain.invoke({"topic": "machine learning"})
    # All components automatically traced in LangSmith dashboard
```

**Features Demonstrated:**
- Zero-configuration tracing setup
- Automatic component instrumentation
- Real-time trace visualization
- Performance metrics collection

### **Demo 2: Custom Run Naming and Tagging**

```python
@traceable(name="named_runs_demo", tags=["production", "summarization"])
def demo_named_runs():
    """Shows how to organize runs with custom names and tags."""
    
    chain = prompt | llm | StrOutputParser()
    result = chain.invoke({"text": "LangSmith provides observability for LLM applications."})
    
    # Run appears with custom name and tags for easy filtering
```

**Features Demonstrated:**
- Custom run naming for better identification
- Tag-based organization and filtering
- Production vs development environment separation
- Team collaboration features

### **Demo 3: Metadata-Driven Observability**

```python
@traceable(name="tracer_with_metadata_demo", tags=["metadata", "filtering"])
def demo_trace_with_metadata(user_id: str, request_type: str):
    """Add contextual metadata for advanced filtering and analysis."""
    
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    result = llm.invoke(f"Hello from user {user_id}")
    
    # Metadata captured: user_id, request_type, timestamps, etc.
```

**Features Demonstrated:**
- Rich metadata collection
- User and request context tracking
- Advanced filtering capabilities
- Business metric correlation

## 🛠️ Technical Implementation

### **Dependencies**

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langsmith import traceable
from langsmith.run_trees import RunTree
import os
from dotenv import load_dotenv
```

### **Environment Setup**

```bash
# Required environment variables
LANGCHAIN_TRACING_V2=true          # Enable LangSmith tracing
LANGSMITH_API_KEY=your-key         # Your LangSmith API key
LANGSMITH_PROJECT=project-name     # Project organization
OPENAI_API_KEY=your-key            # OpenAI API key for demos
```

### **Core LangSmith Features**

#### **1. Automatic Instrumentation**
```python
# All LangChain components automatically traced
chain = prompt | llm | StrOutputParser()
# Each step automatically appears in LangSmith dashboard
```

#### **2. Custom Decorator**
```python
@traceable(name="custom_function", tags=["custom", "demo"])
def my_function(input_data):
    """Custom function with LangSmith tracing."""
    # Function execution traced with custom metadata
    return process_data(input_data)
```

#### **3. Manual Trace Creation**
```python
from langsmith.run_trees import RunTree

# Manual trace creation for custom workflows
with RunTree(name="manual_trace", project_name="my-project") as run:
    run.end(inputs={"input": "data"}, outputs={"output": "result"})
```

## 📊 LangSmith Dashboard Features

### **Trace Visualization**
- **Execution Flow**: Visual representation of component execution
- **Timeline View**: Detailed timing information for each step
- **Input/Output Inspection**: View exact inputs and outputs at each step
- **Error Analysis**: Stack traces and error context visualization

### **Performance Analytics**
- **Latency Metrics**: Response time analysis and trend tracking
- **Token Usage**: Token consumption and cost analysis
- **Success Rates**: Error rates and success rate tracking
- **Performance Comparison**: Compare runs across different time periods

### **Advanced Filtering**
- **Tag-based Filtering**: Filter runs by custom tags
- **Metadata Search**: Search runs by metadata attributes
- **Time Range Selection**: Analyze specific time periods
- **User-based Filtering**: Filter by user IDs or custom attributes

## 🎓 Learning Outcomes

After working through this project, you'll understand:

- ✅ **LangSmith Setup**: Complete environment configuration and initialization
- ✅ **Automatic Tracing**: Zero-config tracing for LangChain components
- ✅ **Custom Instrumentation**: Adding tracing to custom functions and workflows
- ✅ **Metadata Management**: Using metadata for advanced filtering and analysis
- ✅ **Performance Monitoring**: Tracking latency, costs, and success rates
- ✅ **Debugging Techniques**: Using traces to identify and fix issues
- ✅ **Production Best Practices**: Setting up observability for production applications
- ✅ **Team Collaboration**: Sharing traces and collaborating on debugging

## 🚀 Quick Start

### **Prerequisites**

- Python 3.12+
- LangSmith API key (sign up at [smith.langchain.com](https://smith.langchain.com))
- OpenAI API key (for demo examples)
- Basic understanding of LangChain concepts

### **Installation**

```bash
# Clone and navigate to project
cd 69-langsmith-example

# Install dependencies
uv sync

# Or install manually
uv add langchain langchain-core langchain-openai langsmith python-dotenv
```

### **Environment Setup**

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys
# LANGSMITH_API_KEY=your-langsmith-api-key
# OPENAI_API_KEY=your-openai-api-key
# LANGCHAIN_TRACING_V2=true
# LANGSMITH_PROJECT=my-project
```

### **Running the Demos**

```bash
# Run all demonstrations
uv run python main.py

# Individual demos (edit main.py to call specific functions)
uv run python main.py  # Calls demo_basic_tracing(), demo_named_runs(), demo_trace_with_metadata()
```

### **Viewing Results**

1. **Open LangSmith Dashboard**: [smith.langchain.com](https://smith.langchain.com)
2. **Select Your Project**: Choose the project name from environment setup
3. **Explore Traces**: View detailed execution traces and performance metrics
4. **Filter and Analyze**: Use tags and metadata to analyze specific runs

## 🔧 Advanced Features

### **Custom Run Trees**

```python
from langsmith.run_trees import RunTree

def custom_workflow_with_tracing():
    """Create custom trace trees for complex workflows."""
    
    with RunTree(name="complex_workflow", project_name="advanced") as run:
        # Nested operations
        with RunTree(name="step_1", parent_run=run) as step1:
            result1 = process_step_1()
            step1.end(outputs={"result": result1})
        
        with RunTree(name="step_2", parent_run=run) as step2:
            result2 = process_step_2(result1)
            step2.end(outputs={"result": result2})
        
        run.end(outputs={"final_result": result2})
```

### **Evaluation Integration**

```python
from langsmith.evaluation import evaluate

def evaluate_with_langsmith():
    """Integrate evaluation with LangSmith tracing."""
    
    dataset = load_my_dataset()
    
    def evaluator(run, example):
        """Custom evaluator function."""
        return {"score": evaluate_output(run.outputs, example.outputs)}
    
    results = evaluate(
        my_chain,
        data=dataset,
        evaluators=[evaluator],
        experiment_prefix="my_evaluation"
    )
```

### **Feedback Collection**

```python
from langsmith import Client

def collect_user_feedback(run_id: str, feedback: dict):
    """Collect user feedback for runs."""
    
    client = Client()
    client.create_feedback(
        run_id=run_id,
        key="user_rating",
        score=feedback["rating"],
        comment=feedback["comment"],
        value=feedback.get("value")
    )
```

## 🎯 Production Use Cases

### **Application Monitoring**
- **Real-time Performance**: Monitor application performance in production
- **Error Detection**: Automatically detect and alert on errors
- **Usage Analytics**: Track usage patterns and user behavior
- **Cost Optimization**: Monitor token usage and optimize costs

### **Development Workflow**
- **Debugging**: Quickly identify and fix issues in development
- **Performance Optimization**: Identify bottlenecks and optimize performance
- **Testing**: Compare different approaches and configurations
- **Documentation**: Generate automatic documentation from traces

### **Team Collaboration**
- **Knowledge Sharing**: Share traces and insights with team members
- **Onboarding**: Help new developers understand application behavior
- **Code Reviews**: Review traces as part of code review process
- **Incident Response**: Use traces to diagnose production issues

## 📚 Related Concepts

- **Observability**: Complete visibility into system behavior through logs, metrics, and traces
- **Distributed Tracing**: Tracking requests as they flow through distributed systems
- **APM (Application Performance Monitoring)**: Monitoring and managing application performance
- **LLM Ops**: Operational practices for deploying and maintaining LLM applications
- **MLOps**: Machine learning operations practices applied to LLM applications

## 🔮 Advanced LangSmith Features

### **Dataset Management**
- **Dataset Creation**: Create and manage evaluation datasets
- **Version Control**: Track dataset versions and changes
- **Collaboration**: Share datasets with team members
- **Integration**: Use datasets with evaluation and testing workflows

### **Experiment Tracking**
- **A/B Testing**: Compare different model configurations
- **Hyperparameter Tuning**: Track hyperparameter experiments
- **Model Comparison**: Compare performance across different models
- **Result Analysis**: Analyze experiment results and trends

### **Alerting and Notifications**
- **Performance Alerts**: Set up alerts for performance degradation
- **Error Notifications**: Get notified when errors occur
- **Custom Metrics**: Monitor custom business metrics
- **Integration**: Integrate with Slack, email, and other notification systems

## 🤝 Contributing

This project demonstrates LangSmith observability best practices. Feel free to extend it with additional tracing examples, evaluation workflows, and integration patterns.

## 📄 License

This project is educational and demonstrates LangSmith observability patterns for learning and reference purposes.

---

**Built with LangSmith** - Production observability and monitoring for LLM applications.