# LangChain Error Handling & Retry Patterns - Production-Ready Reliability Framework

A comprehensive collection of error handling and reliability patterns for building robust LangChain and LangGraph applications. This project demonstrates essential resilience patterns including retry mechanisms with exponential backoff, circuit breaker patterns, model fallback chains, and LangGraph-based error handling workflows for production-grade LLM applications.

## 🛡️ Overview

Building reliable LLM applications requires sophisticated error handling beyond basic try-catch blocks. This project provides a complete toolkit of resilience patterns that ensure your applications can handle failures gracefully, recover automatically, and maintain high availability even when external services fail. Learn how to implement enterprise-grade reliability patterns that prevent cascading failures and provide seamless user experiences.

## 🚀 Key Reliability Patterns

### **1. Retry Pattern with Exponential Backoff**

- **Automatic Retries**: Configurable retry attempts for transient failures
- **Exponential Backoff**: Intelligent delay calculation to prevent overwhelming services
- **Jitter Addition**: Randomized delays to prevent thundering herd problems
- **Exception Filtering**: Retry only specific types of exceptions
- **Configurable Parameters**: Customizable retry counts, delays, and timeout limits

### **2. Circuit Breaker Pattern**

- **Failure Detection**: Automatic detection of failing services
- **State Management**: Closed, Open, and Half-Open states for service protection
- **Automatic Recovery**: Self-healing capabilities with configurable recovery timeouts
- **Load Shedding**: Prevent cascading failures by blocking calls to failing services
- **Monitoring Integration**: Built-in metrics for circuit state tracking

### **3. Model Fallback Chain**

- **Multiple Model Support**: Automatic fallback between different LLM providers
- **Intelligent Routing**: Try models in priority order until one succeeds
- **Response Caching**: Built-in caching to avoid redundant API calls
- **Performance Optimization**: Fast models first, fallback to more capable models
- **Cost Management**: Balance between speed, cost, and capability

### **4. LangGraph Error Handling Workflows**

- **State-Based Error Handling**: Integrated error handling in LangGraph workflows
- **Conditional Retry Logic**: Smart retry decisions based on workflow state
- **Graceful Degradation**: Fallback behaviors when primary paths fail
- **Error Recovery Patterns**: Automated recovery strategies for different error types
- **Workflow Resilience**: End-to-end error handling across complex multi-step processes

## 🏗️ Reliability Architecture

### **Multi-Layer Defense Strategy**

```
┌─────────────────────────────────────────────────────────────┐
│                    RETRY LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Exponential │  │ Jitter      │  │ Exception          │ │
│  │ Backoff     │  │ Addition    │  │ Filtering          │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                CIRCUIT BREAKER LAYER                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Failure     │  │ State       │  │ Automatic          │ │
│  │ Detection   │  │ Management  │  │ Recovery           │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               FALLBACK CHAIN LAYER                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Multiple    │  │ Intelligent │  │ Response           │ │
│  │ Models      │  │ Routing     │  │ Caching            │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│            LANGGRAPH WORKFLOW LAYER                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ State-Based │  │ Conditional │  │ Graceful            │ │
│  │ Error       │  │ Retry       │  │ Degradation        │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### **Core Reliability Components**

#### **1. Retry Decorator**

```python
@with_retry(max_retries=3, base_delay=1.0, max_delay=30.0)
def unreliable_api_call(query: str) -> str:
    """Function with automatic retry logic."""
    # Simulate occasional failures
    if random.random() < 0.3:
        raise Exception("API call failed")
    return f"Response to: {query}"
```

#### **2. Circuit Breaker Class**

```python
class CircuitBreaker:
    """Circuit breaker pattern for failing services."""
    
    def __init__(self, failure_threshold: int = 5, recovery_timeout: float = 30.0):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.state = "closed"  # closed, open, half-open
    
    def call(self, func: Callable, *args, **kwargs):
        """Execute function with circuit breaker protection."""
        # Protects against cascading failures
```

#### **3. Fallback Chain**

```python
class FallbackChain:
    """Try multiple models in order until one succeeds."""
    
    def __init__(self):
        self.models = [
            ("gpt-4o", ChatOpenAI(model="gpt-4o", temperature=0, timeout=10)),
            ("claude-sonnet", ChatAnthropic(model="claude-sonnet-4-5-20250929", temperature=0, timeout=10)),
            ("gpt-4o-mini", ChatOpenAI(model="gpt-4o-mini", temperature=0, timeout=10)),
        ]
        self.cache = {}
```

#### **4. LangGraph Error Handling**

```python
def create_robust_agent():
    """Create agent with built-in error handling."""
    
    def process_with_retry(state: RobustState) -> dict:
        """Process with retry logic built-in."""
        try:
            # Simulate occasional failure
            if random.random() < 0.3 and state["retry_count"] < 2:
                raise Exception("Simulated processing error")
            response = llm.invoke(state["messages"])
            return {"messages": [response], "success": True, "error": None}
        except Exception as e:
            return {"error": str(e), "retry_count": state["retry_count"] + 1, "success": False}
```

## 📋 Reliability Demonstrations

### **Demo 1: Retry Pattern with Exponential Backoff**

```python
def demo_retry_pattern():
    """Demonstrate retry pattern with exponential backoff."""
    
    @with_retry(max_retries=3, base_delay=1.0, max_delay=30.0)
    def unreliable_api_call(query: str) -> str:
        if random.random() < 0.3:
            raise Exception("API call failed")
        return f"Response to: {query}"
    
    for i in range(3):
        try:
            result = unreliable_api_call(f"Query {i}")
            print(f"✅ {result}")
        except Exception as e:
            print(f"❌ Failed after retries: {e}")
```

**Reliability Features Demonstrated:**

- Automatic retry with exponential backoff
- Jitter addition to prevent thundering herd
- Configurable retry limits and delays
- Exception filtering and handling

### **Demo 2: Circuit Breaker Pattern**

```python
def demo_circuit_breaker():
    """Demonstrate circuit breaker pattern."""
    
    breaker = CircuitBreaker(failure_threshold=3, recovery_timeout=5.0)
    
    def flaky_service():
        if random.random() < 0.7:
            raise Exception("Service error")
        return "OK"
    
    for i in range(15):
        try:
            result = breaker.call(flaky_service)
            print(f"Attempt {i + 1}: ✅ {result} (state: {breaker.state})")
        except Exception as e:
            print(f"Attempt {i + 1}: ❌ {e} (state: {breaker.state})")
```

**Reliability Features Demonstrated:**

- Automatic failure detection and circuit opening
- Self-healing with configurable recovery timeout
- State management (closed, open, half-open)
- Protection against cascading failures

### **Demo 3: Model Fallback Chain**

```python
def demo_fallback_chain():
    """Demonstrate fallback chain."""
    
    chain = FallbackChain()
    
    queries = [
        "What is 2 + 2?",
        "What is Python?",
        "What is 2 + 2?",  # Should hit cache
    ]
    
    for query in queries:
        try:
            result, model = chain.invoke(query)
            print(f"Query: {query}")
            print(f"  Model: {model}")
            print(f"  Response: {result[:50]}...")
        except Exception as e:
            print(f"Query: {query}")
            print(f"  ❌ Error: {e}")
```

**Reliability Features Demonstrated:**

- Multiple model fallback with priority routing
- Response caching for performance optimization
- Error tracking and reporting
- Cost-effective model selection

### **Demo 4: LangGraph Error Handling**

```python
def demo_robust_agent():
    """Demonstrate robust agent with error handling."""
    
    agent = create_robust_agent()
    
    for i in range(3):
        result = agent.invoke({
            "messages": [HumanMessage(content="Hello!")],
            "error": None,
            "retry_count": 0,
            "max_retries": 3,
            "success": False,
        })
        
        status = "✅ Success" if result["success"] else "❌ Failed"
        print(f"Attempt {i + 1}: {status}")
        print(f"  Retries used: {result['retry_count']}")
        print(f"  Response: {result['messages'][-1].content[:50]}...")
```

**Reliability Features Demonstrated:**

- State-based error handling in workflows
- Conditional retry logic based on workflow state
- Graceful degradation with fallback behaviors
- End-to-end error recovery in complex processes

## 🛠️ Technical Implementation

### **Dependencies**

```python
import time
import random
from typing import Literal, Optional, Callable
from functools import wraps
from langchain_anthropic import ChatAnthropic
from langgraph.graph import StateGraph, START, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage
from typing_extensions import TypedDict, Annotated
import operator
from langsmith import traceable
from dotenv import load_dotenv
```

### **Environment Setup**

```bash
# Required environment variables
OPENAI_API_KEY=your-openai-api-key          # For OpenAI models
ANTHROPIC_API_KEY=your-anthropic-api-key    # For Claude models
LANGSMITH_API_KEY=your-langsmith-api-key    # For tracing
LANGCHAIN_TRACING_V2=true                   # Enable LangSmith
LANGSMITH_PROJECT=error_handling_patterns    # Project organization
```

### **Core Pattern Implementations**

#### **Retry Pattern with Jitter**

```python
def with_retry(max_retries: int = 3, base_delay: float = 1.0, max_delay: float = 30.0):
    """Retry decorator with exponential backoff and jitter."""
    
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt < max_retries - 1:
                        # Exponential backoff with jitter
                        delay = min(base_delay * (2**attempt), max_delay)
                        delay = delay * (0.5 + random.random())  # Add jitter
                        time.sleep(delay)
            raise
        return wrapper
    return decorator
```

#### **Circuit Breaker Implementation**

```python
class CircuitBreaker:
    """Circuit breaker pattern for failing services."""
    
    def __init__(self, failure_threshold: int = 5, recovery_timeout: float = 30.0):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failures = 0
        self.last_failure_time = 0
        self.state = "closed"  # closed, open, half-open
    
    def call(self, func: Callable, *args, **kwargs):
        """Execute function with circuit breaker protection."""
        # Check if circuit should move from open to half-open
        if self.state == "open":
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = "half-open"
            else:
                raise Exception("Circuit breaker is OPEN")
        
        try:
            result = func(*args, **kwargs)
            
            # Success - reset on half-open
            if self.state == "half-open":
                self.state = "closed"
                self.failures = 0
            
            return result
        
        except Exception as e:
            self.failures += 1
            self.last_failure_time = time.time()
            
            if self.failures >= self.failure_threshold:
                self.state = "open"
            
            raise e
```

#### **Fallback Chain with Caching**

```python
class FallbackChain:
    """Try multiple models in order until one succeeds."""
    
    def __init__(self):
        self.models = [
            ("gpt-4o", ChatOpenAI(model="gpt-4o", temperature=0, timeout=10)),
            ("claude-sonnet", ChatAnthropic(model="claude-sonnet-4-5-20250929", temperature=0, timeout=10)),
            ("gpt-4o-mini", ChatOpenAI(model="gpt-4o-mini", temperature=0, timeout=10)),
        ]
        self.cache = {}
    
    @traceable(name="fallback_invoke")
    def invoke(self, query: str, use_cache: bool = True) -> tuple[str, str]:
        """Invoke with fallbacks. Returns: (response, model_used)"""
        
        # Check cache first
        if use_cache and query in self.cache:
            return self.cache[query], "cache"
        
        errors = []
        
        for model_name, model in self.models:
            try:
                response = model.invoke(query)
                result = response.content
                
                # Cache successful response
                self.cache[query] = result
                
                return result, model_name
            
            except Exception as e:
                errors.append(f"{model_name}: {str(e)}")
                continue
        
        # All models failed
        raise Exception(f"All models failed: {errors}")
```

## 📈 Reliability Metrics and Monitoring

### **Key Performance Indicators**

```python
# Example reliability metrics
reliability_metrics = {
    "retry_success_rate": 0.85,        # 85% of retries succeed
    "circuit_breaker_trips": 12,       # 12 times circuit opened
    "fallback_usage_rate": 0.15,       # 15% of requests use fallback
    "cache_hit_rate": 0.60,            # 60% cache hit rate
    "average_recovery_time": 45.2,     # seconds
    "error_reduction": 0.78,           # 78% fewer errors with patterns
}
```

### **Monitoring Integration**

```python
# LangSmith tracing for all reliability patterns
@traceable(name="retry_pattern_execution")
def with_retry_traced(max_retries: int = 3):
    """Retry pattern with LangSmith tracing."""
    # Automatic tracing of retry attempts, delays, and outcomes

@traceable(name="circuit_breaker_execution")
def circuit_breaker_tracked():
    """Circuit breaker with state tracking."""
    # Track state changes, failure counts, and recovery events

@traceable(name="fallback_chain_execution")
def fallback_chain_traced():
    """Fallback chain with model usage tracking."""
    # Track which models are used, fallback triggers, and cache performance
```

## 🎯 Learning Outcomes

After working through this project, you'll understand:

- ✅ **Retry Patterns**: Exponential backoff, jitter, and intelligent retry logic
- ✅ **Circuit Breaker**: Failure detection, state management, and self-healing
- ✅ **Fallback Chains**: Multi-model routing, caching, and performance optimization
- ✅ **LangGraph Error Handling**: State-based error handling in complex workflows
- ✅ **Reliability Architecture**: Multi-layer defense strategies for LLM applications
- ✅ **Monitoring Integration**: Tracing and metrics for reliability patterns
- ✅ **Production Patterns**: Enterprise-grade error handling for real-world applications
- ✅ **Performance Optimization**: Balancing reliability, cost, and user experience

## 🚀 Quick Start

### **Prerequisites**

- Python 3.12+
- OpenAI API key (for GPT models)
- Anthropic API key (for Claude models)
- LangSmith API key (for tracing)
- Basic understanding of LangChain and LangGraph concepts

### **Installation**

```bash
# Clone and navigate to project
cd 72-langchain-error-handling-retry-patterns

# Install dependencies
uv sync

# Or install manually
uv add langchain langchain-anthropic langchain-core langchain-openai langsmith pytest python-dotenv
```

### **Environment Setup**

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys
# OPENAI_API_KEY=your-openai-api-key
# ANTHROPIC_API_KEY=your-anthropic-api-key
# LANGSMITH_API_KEY=your-langsmith-api-key
# LANGCHAIN_TRACING_V2=true
# LANGSMITH_PROJECT=error_handling_patterns
```

### **Running the Reliability Demos**

```bash
# Run all reliability demonstrations
uv run python main.py

# Individual demos (edit main.py to call specific functions):
# uv run python main.py  # LangGraph error handling by default

# Available demos:
# demo_retry_pattern()           # Retry with exponential backoff
# demo_circuit_breaker()         # Circuit breaker pattern
# demo_fallback_chain()          # Model fallback chain
# demo_robust_agent()            # LangGraph error handling
```

### **Viewing Reliability Metrics in LangSmith**

1. **Open LangSmith Dashboard**: [smith.langchain.com](https://smith.langchain.com)
2. **Select Project**: Choose "error_handling_patterns"
3. **View Traces**: Monitor retry attempts, circuit breaker state changes, and fallback usage
4. **Analyze Performance**: Track reliability metrics and error reduction
5. **Monitor Health**: Observe system resilience under failure conditions

## 🔧 Advanced Reliability Features

### **Custom Retry Strategies**

```python
class AdaptiveRetry:
    """Adaptive retry that adjusts based on error patterns."""
    
    def __init__(self):
        self.error_patterns = {}
        self.success_rates = {}
    
    def get_retry_strategy(self, error_type: str):
        """Adjust retry parameters based on historical error patterns."""
        # Dynamic retry configuration based on error history
```

### **Distributed Circuit Breaker**

```python
class DistributedCircuitBreaker:
    """Circuit breaker with distributed state management."""
    
    def __init__(self, redis_client):
        self.redis = redis_client
        # Share circuit state across multiple instances
```

### **Smart Fallback Selection**

```python
class SmartFallbackChain:
    """Intelligent fallback based on query complexity and cost."""
    
    def select_model(self, query: str, complexity_score: float):
        """Choose optimal model based on query characteristics."""
        # Balance between capability, cost, and speed
```

## 🎯 Production Reliability Best Practices

### **1. Multi-Layer Defense Strategy**

- **Retry Layer**: Handle transient failures with exponential backoff
- **Circuit Breaker Layer**: Protect against cascading failures
- **Fallback Layer**: Ensure service continuity with alternative models
- **Workflow Layer**: End-to-end error handling in complex processes

### **2. Monitoring and Alerting**

- **Real-time Metrics**: Track retry rates, circuit states, and fallback usage
- **Health Checks**: Monitor system resilience and recovery patterns
- **Alert Thresholds**: Notify when reliability degrades beyond acceptable limits
- **Performance Impact**: Measure the cost of reliability patterns

### **3. Configuration Management**

- **Environment-Specific Settings**: Different parameters for dev/staging/prod
- **Dynamic Configuration**: Adjust reliability patterns without deployment
- **Feature Flags**: Enable/disable patterns based on system conditions
- **A/B Testing**: Compare reliability strategies in production

### **4. Cost Optimization**

- **Smart Caching**: Reduce redundant API calls with intelligent caching
- **Model Selection**: Balance cost vs. capability in fallback chains
- **Retry Limits**: Prevent infinite retry loops and cost overruns
- **Circuit Thresholds**: Optimize failure detection for cost efficiency

## 📚 Reliability Concepts Covered

- **Exponential Backoff**: Intelligent delay calculation for retry patterns
- **Jitter**: Randomized delays to prevent thundering herd problems
- **Circuit Breaker**: Failure detection and automatic recovery patterns
- **Fallback Chains**: Multi-model routing for service continuity
- **State-Based Error Handling**: Workflow-level error management
- **Graceful Degradation**: Maintaining functionality under failure conditions
- **Self-Healing Systems**: Automatic recovery from transient failures
- **Distributed Reliability**: Scalable patterns for multi-instance deployments

## 🔮 Advanced Reliability Patterns

### **Adaptive Reliability**

- **Dynamic Thresholds**: Adjust circuit breaker thresholds based on load
- **Machine Learning**: Predict failure patterns and pre-emptive action
- **Chaos Engineering**: Proactive failure injection for resilience testing
- **Predictive Scaling**: Anticipate and prepare for failure scenarios

### **Cross-Service Reliability**

- **Bulkhead Patterns**: Isolate failures to prevent system-wide impact
- **Service Mesh Integration**: Advanced reliability at infrastructure level
- **Distributed Tracing**: End-to-end reliability across service boundaries
- **Failure Propagation Control**: Limit cascading failures in microservices

## 🤝 Extending the Reliability Framework

This project provides a foundation for LLM reliability that can be extended with:

- **Custom Error Handlers**: Domain-specific error recovery strategies
- **Integration with Monitoring**: Prometheus, Grafana, and custom dashboards
- **Advanced Caching**: Redis, Memcached, and distributed cache layers
- **Multi-Region Fallback**: Geographic redundancy for global applications
- **Compliance Integration**: HIPAA, SOC2, and regulatory compliance patterns

## 📄 License

This project is educational and demonstrates reliability patterns for learning and reference purposes. Use these patterns as a foundation for building robust, production-ready LLM applications with enterprise-grade reliability.

---

**Built for Reliability** - Production-ready error handling and retry patterns for resilient LLM applications.