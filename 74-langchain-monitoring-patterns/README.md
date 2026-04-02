# LangChain Monitoring Patterns - Production-Ready Observability

A comprehensive collection of monitoring and logging patterns for building observable LangChain applications. This project demonstrates essential observability strategies including structured logging, metrics collection, performance monitoring, and distributed tracing for production-grade LLM applications.

## 📊 Overview

Building LLM applications at scale requires sophisticated monitoring beyond basic logging. This project provides a complete toolkit of observability patterns that ensure your applications can be monitored, debugged, and optimized effectively. Learn how to implement enterprise-grade monitoring that provides insights into performance, errors, and user behavior.

## 🚀 Key Monitoring Patterns

### **1. Structured Logging System**

- **JSON Formatted Logs**: Consistent JSON structure for log aggregation systems
- **Rich Context**: Automatic inclusion of module, function, and timestamp information
- **Extra Data Support**: Flexible additional context for detailed debugging
- **UTC Timestamps**: Standardized timezone handling for global applications
- **Configurable Levels**: Support for different log levels and filtering

### **2. Metrics Collection Framework**

- **Request Metrics**: Total requests, error rates, and latency tracking
- **Token Usage**: Input/output token monitoring for cost optimization
- **Cache Performance**: Hit/miss ratios for caching optimization
- **Real-time Aggregation**: Live metrics calculation and summarization
- **Performance Insights**: Average latency and error rate calculations

### **3. Distributed Tracing Integration**

- **LangSmith Integration**: Automatic tracing for all LLM operations
- **Request Correlation**: End-to-end request tracking across components
- **Performance Analysis**: Detailed timing and execution flow analysis
- **Error Tracing**: Complete error context and stack trace capture
- **Debugging Support**: Rich trace data for troubleshooting

### **4. Instrumented Components**

- **LLM Wrapper**: Fully instrumented LLM calls with automatic metrics
- **Error Handling**: Comprehensive error tracking and reporting
- **Performance Monitoring**: Real-time latency and throughput monitoring
- **Resource Usage**: Token consumption and cost tracking
- **Health Checks**: Application health and availability monitoring

## 🏗️ Monitoring Architecture

### **Multi-Layer Observability Stack**

```
┌─────────────────────────────────────────────────────────────┐
│                DISTRIBUTED TRACING LAYER                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ LangSmith   │  │ Request     │  │ Performance         │ │
│  │ Integration │ │ Correlation │  │ Analysis            │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               METRICS COLLECTION LAYER                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Request     │  │ Token       │  │ Cache               │ │
│  │ Metrics     │  │ Usage       │  │ Performance         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              STRUCTURED LOGGING LAYER                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ JSON        │  │ Rich        │  │ UTC                 │ │
│  │ Formatting  │  │ Context     │  │ Timestamps          │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│            INSTRUMENTED COMPONENTS LAYER                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ LLM         │  │ Error       │  │ Performance         │ │
│  │ Wrapper     │  │ Handling    │  │ Monitoring          │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### **Core Monitoring Components**

#### **1. JSON Formatter Class**
```python
class JSONFormatter(logging.Formatter):
    """Format logs as JSON for log aggregation."""
    
    def format(self, record):
        log_obj = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
        }
        
        if hasattr(record, "extra_data"):
            log_obj.update(record.extra_data)
        
        return json.dumps(log_obj)
```

#### **2. Metrics Collector**
```python
class MetricsCollector:
    """Collect and aggregate metrics."""
    
    def __init__(self):
        self.metrics = {
            "requests_total": 0,
            "errors_total": 0,
            "latency_sum": 0,
            "latency_count": 0,
            "tokens_input": 0,
            "tokens_output": 0,
            "cache_hits": 0,
            "cache_misses": 0,
        }
    
    def record_request(self, latency_ms, input_tokens, output_tokens, error=False, cache_hit=False):
        # Record request metrics with automatic aggregation
    
    def get_summary(self) -> dict:
        # Calculate aggregated metrics and performance insights
```

#### **3. Instrumented LLM**
```python
class InstrumentedLLM:
    """LLM with full instrumentation."""
    
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
        self.metrics = MetricsCollector()
        self.logger = setup_logging()
    
    @traceable(name="instrumented_invoke")
    def invoke(self, query: str) -> str:
        # Fully instrumented LLM call with metrics and logging
```

## 📋 Monitoring Demonstrations

### **Demo: Complete Monitoring System**

```python
def demo_monitoring():
    """Demonstrate complete monitoring system."""
    
    llm = InstrumentedLLM()
    
    queries = [
        "What is Python?",
        "Explain machine learning.",
        "What is 2 + 2?",
    ]
    
    for query in queries:
        result = llm.invoke(query)
        print(f"Query: {query[:30]}... -> {result[:30]}...")
    
    print("\nMetrics Summary:")
    summary = llm.metrics.get_summary()
    for key, value in summary.items():
        print(f"  {key}: {value}")
```

**Monitoring Features Demonstrated:**
- Automatic structured logging with JSON format
- Real-time metrics collection and aggregation
- LangSmith tracing integration
- Performance monitoring and error tracking
- Token usage and cost monitoring

## 🛠️ Technical Implementation

### **Dependencies**

```python
import logging
import json
import time
from datetime import datetime, timezone
from functools import wraps
from typing import Any, Callable
from langchain_openai import ChatOpenAI
from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.messages import HumanMessage
from langsmith import traceable
from dotenv import load_dotenv
```

### **Environment Setup**

```bash
# Required environment variables
OPENAI_API_KEY=your-openai-api-key          # For OpenAI models
LANGSMITH_API_KEY=your-langsmith-api-key    # For tracing
LANGCHAIN_TRACING_V2=true                   # Enable LangSmith
LANGSMITH_PROJECT=monitoring_patterns       # Project organization
```

### **Core Pattern Implementations**

#### **Structured JSON Logging**
```python
class JSONFormatter(logging.Formatter):
    """Format logs as JSON for log aggregation."""
    
    def format(self, record):
        log_obj = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
        }
        
        if hasattr(record, "extra_data"):
            log_obj.update(record.extra_data)
        
        return json.dumps(log_obj)

def setup_logging():
    """Setup structured JSON logging."""
    
    logger = logging.getLogger("langchain_app")
    logger.setLevel(logging.INFO)
    
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())
    logger.addHandler(handler)
    
    return logger
```

#### **Comprehensive Metrics Collection**
```python
class MetricsCollector:
    """Collect and aggregate metrics."""
    
    def __init__(self):
        self.metrics = {
            "requests_total": 0,
            "errors_total": 0,
            "latency_sum": 0,
            "latency_count": 0,
            "tokens_input": 0,
            "tokens_output": 0,
            "cache_hits": 0,
            "cache_misses": 0,
        }
    
    def record_request(
        self,
        latency_ms: float,
        input_tokens: int,
        output_tokens: int,
        error: bool = False,
        cache_hit: bool = False,
    ):
        self.metrics["requests_total"] += 1
        self.metrics["latency_sum"] += latency_ms
        self.metrics["latency_count"] += 1
        self.metrics["tokens_input"] += input_tokens
        self.metrics["tokens_output"] += output_tokens
        
        if error:
            self.metrics["errors_total"] += 1
        
        if cache_hit:
            self.metrics["cache_hits"] += 1
        else:
            self.metrics["cache_misses"] += 1
    
    def get_summary(self) -> dict:
        avg_latency = (
            self.metrics["latency_sum"] / self.metrics["latency_count"]
            if self.metrics["latency_count"] > 0
            else 0
        )
        error_rate = (
            self.metrics["errors_total"] / self.metrics["requests_total"]
            if self.metrics["requests_total"] > 0
            else 0
        )
        cache_hit_rate = (
            self.metrics["cache_hits"]
            / (self.metrics["cache_hits"] + self.metrics["cache_misses"])
            if (self.metrics["cache_hits"] + self.metrics["cache_misses"]) > 0
            else 0
        )
        
        return {
            "total_requests": self.metrics["requests_total"],
            "total_errors": self.metrics["errors_total"],
            "error_rate": f"{error_rate:.2%}",
            "avg_latency_ms": round(avg_latency, 2),
            "total_input_tokens": self.metrics["tokens_input"],
            "total_output_tokens": self.metrics["tokens_output"],
            "cache_hit_rate": f"{cache_hit_rate:.2%}",
        }
```

#### **Fully Instrumented LLM Wrapper**
```python
class InstrumentedLLM:
    """LLM with full instrumentation."""
    
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
        self.metrics = MetricsCollector()
        self.logger = setup_logging()
    
    @traceable(name="instrumented_invoke")
    def invoke(self, query: str) -> str:
        start_time = time.time()
        
        try:
            response = self.llm.invoke(query)
            result = response.content
            
            # Estimate tokens
            input_tokens = len(query.split()) * 4 // 3
            output_tokens = len(result.split()) * 4 // 3
            
            self.metrics.record_request(
                latency_ms=(time.time() - start_time) * 1000,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                error=False,
                cache_hit=False,
            )
            
            self.logger.info(
                "LLM request completed",
                extra={
                    "extra_data": {
                        "latency_ms": (time.time() - start_time) * 1000,
                        "input_tokens": input_tokens,
                        "output_tokens": output_tokens,
                    }
                },
            )
            
            return result
        
        except Exception as e:
            self.metrics.record_request(
                latency_ms=(time.time() - start_time) * 1000,
                input_tokens=0,
                output_tokens=0,
                error=True,
                cache_hit=False,
            )
            
            self.logger.error(
                f"LLM request failed: {e}",
                extra={"extra_data": {"error": str(e)}},
            )
            
            raise
```

## 📈 Monitoring Metrics and Analytics

### **Key Performance Indicators**

```python
# Example monitoring metrics
monitoring_metrics = {
    "total_requests": 150,              # Total number of requests
    "error_rate": "2.50%",              # Percentage of failed requests
    "avg_latency_ms": 245.75,           # Average response time
    "total_input_tokens": 12500,        # Total input tokens used
    "total_output_tokens": 8750,        # Total output tokens generated
    "cache_hit_rate": "35.20%",         # Cache effectiveness
    "requests_per_minute": 12.5,        # Request throughput
    "cost_per_request": 0.0023,         # Average cost per request
}
```

### **LangSmith Integration**

```python
# Automatic tracing for all monitoring patterns
@traceable(name="llm_monitoring_execution")
def monitored_llm_call():
    """LLM call with comprehensive monitoring."""
    # Automatic tracing of performance metrics and errors

@traceable(name="metrics_collection")
def metrics_collection_traced():
    """Metrics collection with tracing."""
    # Track metrics collection and aggregation

@traceable(name="structured_logging")
def structured_logging_traced():
    """Structured logging with trace correlation."""
    # Correlate logs with distributed traces
```

## 🎯 Learning Outcomes

After working through this project, you'll understand:

- ✅ **Structured Logging**: JSON-formatted logging with rich context and correlation
- ✅ **Metrics Collection**: Comprehensive performance and usage metrics
- ✅ **Distributed Tracing**: LangSmith integration for end-to-end tracing
- ✅ **Performance Monitoring**: Real-time latency and throughput monitoring
- ✅ **Error Tracking**: Comprehensive error logging and alerting
- ✅ **Production Patterns**: Enterprise-grade monitoring for real-world applications
- ✅ **Resource Monitoring**: Token usage and cost optimization insights
- ✅ **Observability**: Complete system visibility and debugging capabilities

## 🚀 Quick Start

### **Prerequisites**

- Python 3.12+
- OpenAI API key (for GPT models)
- LangSmith API key (for tracing)
- Basic understanding of LangChain concepts

### **Installation**

```bash
# Clone and navigate to project
cd 74-langchain-monitoring-patterns

# Install dependencies
uv sync

# Or install manually
uv add langchain langchain-core langchain-openai langsmith pytest python-dotenv
```

### **Environment Configuration**

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys
# OPENAI_API_KEY=your-openai-api-key
# LANGSMITH_API_KEY=your-langsmith-api-key
# LANGCHAIN_TRACING_V2=true
# LANGSMITH_PROJECT=monitoring_patterns
```

### **Running the Monitoring Demo**

```bash
# Run monitoring demonstration
uv run python main.py

# Available demos:
# demo_monitoring()              # Complete monitoring system
# setup_logging()               # Structured logging setup
# MetricsCollector()            # Metrics collection framework
```

### **Viewing Monitoring Data in LangSmith**

1. **Open LangSmith Dashboard**: [smith.langchain.com](https://smith.langchain.com)
2. **Select Project**: Choose "monitoring_patterns"
3. **View Traces**: Monitor LLM calls with performance metrics
4. **Analyze Performance**: Track latency, errors, and token usage
5. **Debug Issues**: Use trace data for troubleshooting

## 🔧 Advanced Monitoring Features

### **Custom Metrics and Alerting**

```python
class AdvancedMetricsCollector(MetricsCollector):
    """Extended metrics with alerting capabilities."""
    
    def __init__(self):
        super().__init__()
        self.alerts = []
        self.thresholds = {
            "error_rate": 0.05,      # 5% error rate threshold
            "latency_ms": 1000,      # 1 second latency threshold
            "cache_hit_rate": 0.30,  # 30% cache hit rate threshold
        }
    
    def check_alerts(self):
        """Check metrics against thresholds and generate alerts."""
        # Implement alerting logic based on metrics
```

### **Log Aggregation Integration**

```python
class LogAggregator:
    """Integration with log aggregation systems."""
    
    def __init__(self, endpoint: str):
        self.endpoint = endpoint
    
    def send_logs(self, logs: list):
        """Send structured logs to aggregation system."""
        # Integration with ELK, Splunk, or similar systems
```

### **Performance Dashboards**

```python
class DashboardMetrics:
    """Metrics formatted for dashboard visualization."""
    
    def get_dashboard_data(self):
        """Format metrics for dashboard display."""
        return {
            "performance": {
                "latency_trend": self.get_latency_trend(),
                "error_rate_trend": self.get_error_trend(),
                "throughput_trend": self.get_throughput_trend(),
            },
            "usage": {
                "token_usage": self.get_token_usage(),
                "cache_performance": self.get_cache_metrics(),
                "cost_analysis": self.get_cost_metrics(),
            }
        }
```

## 🎯 Production Monitoring Best Practices

### **1. Multi-Layer Monitoring Strategy**

- **Structured Logging**: JSON-formatted logs for aggregation and analysis
- **Metrics Collection**: Real-time performance and usage metrics
- **Distributed Tracing**: End-to-end request tracking
- **Alerting**: Proactive notification of performance issues

### **2. Performance Monitoring and Alerting**

- **Latency Tracking**: Monitor response times and identify bottlenecks
- **Error Rate Monitoring**: Track error rates and set alerting thresholds
- **Throughput Analysis**: Monitor request volume and capacity planning
- **Resource Usage**: Track token consumption and cost optimization

### **3. Log Management and Analysis**

- **Structured Format**: Consistent JSON structure for log processing
- **Correlation IDs**: Link logs to distributed traces
- **Log Levels**: Appropriate use of log levels for filtering
- **Retention Policies**: Manage log storage and archival

### **4. Metrics and Analytics**

- **Key Performance Indicators**: Define and track essential metrics
- **Trend Analysis**: Monitor performance trends over time
- **Capacity Planning**: Use metrics for scaling decisions
- **Cost Optimization**: Track and optimize resource usage

## 📚 Monitoring Concepts Covered

- **Structured Logging**: JSON-formatted logging with rich context and correlation
- **Metrics Collection**: Comprehensive performance and usage metrics
- **Distributed Tracing**: LangSmith integration for end-to-end tracing
- **Performance Monitoring**: Real-time latency and throughput monitoring
- **Error Tracking**: Comprehensive error logging and alerting
- **Resource Monitoring**: Token usage and cost optimization insights
- **Observability**: Complete system visibility and debugging capabilities
- **Production Monitoring**: Enterprise-grade monitoring for scalable applications

## 🔮 Advanced Monitoring Patterns

### **Real-time Alerting**
- **Threshold-based Alerts**: Automatic notifications for metric violations
- **Anomaly Detection**: ML-based identification of unusual patterns
- **Multi-channel Notifications**: Email, Slack, PagerDuty integrations
- **Escalation Policies**: Tiered alerting based on severity

### **Predictive Monitoring**
- **Performance Prediction**: Forecast capacity needs based on trends
- **Failure Prediction**: Identify potential issues before they impact users
- **Capacity Planning**: Predict resource requirements for scaling
- **Cost Forecasting**: Project future costs based on usage patterns

## 🤝 Extending the Monitoring Framework

This project provides a foundation for LLM monitoring that can be extended with:

- **Custom Metrics**: Domain-specific metrics and KPIs
- **Third-party Integrations**: Integration with monitoring platforms
- **Advanced Analytics**: Machine learning for anomaly detection
- **Enterprise Features**: Multi-tenant monitoring and RBAC
- **Compliance Monitoring**: Audit trails and compliance reporting

## 📄 License

This project is educational and demonstrates monitoring patterns for learning and reference purposes. Use these patterns as a foundation for building observable, production-ready LLM applications with enterprise-grade monitoring.

---

**Built for Observability** - Production-ready monitoring patterns for visible LLM applications.