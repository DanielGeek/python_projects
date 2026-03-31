# LangChain Testing & Evaluation Patterns - Production-Ready Testing Framework

A comprehensive collection of testing patterns and evaluation frameworks for building reliable LLM applications. This project demonstrates essential testing techniques including unit testing with mocks, integration testing with real LLMs, LLM-as-judge evaluation, regression testing, and production-ready evaluation datasets with LangSmith integration.

## 🧪 Overview

Testing LLM applications requires specialized approaches beyond traditional software testing. This project provides a complete toolkit of testing patterns that ensure reliability, consistency, and performance of LLM applications in production. Learn how to implement comprehensive testing strategies that catch issues early, maintain quality over time, and enable confident deployment of LLM-powered features.

## 🚀 Key Testing Patterns

### **1. Unit Testing with Mocks**

- **Mock LLM Responses**: Test application logic without API calls
- **Deterministic Testing**: Consistent results for reliable unit tests
- **Edge Case Handling**: Test empty responses, errors, and edge cases
- **Fast Execution**: Quick feedback loops during development
- **Cost Effective**: No API costs for unit testing

### **2. Integration Testing with Real LLMs**

- **End-to-End Validation**: Test complete workflows with real LLM responses
- **Performance Testing**: Measure actual response times and quality
- **API Integration**: Verify real API connections and error handling
- **Quality Assurance**: Ensure real-world performance meets expectations
- **Behavioral Testing**: Validate actual LLM behavior patterns

### **3. LLM-as-Judge Evaluation**

- **Automated Scoring**: Use LLMs to evaluate response quality automatically
- **Multi-Dimensional Metrics**: Evaluate correctness, relevance, clarity, completeness
- **Consistent Evaluation**: Standardized evaluation criteria across test runs
- **Scalable Assessment**: Evaluate large datasets efficiently
- **Quality Benchmarking**: Establish and track quality standards

### **4. Regression Testing**

- **Quality Tracking**: Monitor performance over time
- **Change Impact**: Detect when updates break existing functionality
- **Threshold Monitoring**: Automated alerts for quality degradation
- **Historical Comparison**: Track improvements and regressions
- **Continuous Quality**: Maintain standards as applications evolve

### **5. LangSmith Evaluation Datasets**

- **Persistent Test Suites**: Version-controlled evaluation datasets
- **Collaborative Testing**: Share test cases across teams
- **Experiment Comparison**: Compare different models and prompts
- **Production Monitoring**: Continuous evaluation in production
- **Audit Trail**: Complete history of model performance

## 🏗️ Testing Architecture

### **Multi-Layer Testing Strategy**

```
┌─────────────────────────────────────────────────────────────┐
│                    UNIT TESTING                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Mock LLM    │  │ Edge Cases  │  │ Fast Feedback       │ │
│  │ Responses   │  │ Testing     │  │ Loops               │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                INTEGRATION TESTING                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Real LLM    │  │ End-to-End  │  │ Performance         │ │
│  │ Calls       │  │ Workflows   │  │ Measurement         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               LLM-AS-JUDGE EVALUATION                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Automated   │  │ Multi-      │  │ Quality             │ │
│  │ Scoring     │  │ Dimensional │  │ Benchmarking        │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              REGRESSION TESTING                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Quality     │  │ Change      │  │ Threshold           │ │
│  │ Tracking    │  │ Impact      │  │ Monitoring          │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│            LANGSMITH EVALUATION                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Persistent  │  │ Experiment  │  │ Production          │ │
│  │ Datasets    │  │ Comparison  │  │ Monitoring          │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### **Core Testing Components**

#### **1. QAChain Class (Unit Testing)**
```python
class QAChain:
    """Simple Q&A chain for testing."""
    
    def __init__(self, llm=None):
        self.llm = llm or ChatOpenAI(model="gpt-4o-mini", temperature=0)
        self.prompt = ChatPromptTemplate.from_template(
            "Answer this question: {question}"
        )
    
    def ask(self, question: str) -> str:
        prompt_value = self.prompt.invoke({"question": question})
        response = self.llm.invoke(prompt_value)
        return response.content
```

#### **2. LLMEvaluator Class (LLM-as-Judge)**
```python
class LLMEvaluator:
    """Use LLM to evaluate LLM outputs."""
    
    @traceable(name="evaluate_response")
    def evaluate(self, question: str, response: str, reference: str = None) -> dict:
        """Evaluate a response on multiple dimensions."""
        # Returns: {"correctness": X, "relevance": X, "clarity": X, "completeness": X, "overall": X}
```

#### **3. RegressionTestRunner Class**
```python
class RegressionTestRunner:
    """Run regression tests against a test dataset."""
    
    @traceable(name="regression_tests")
    def run(self, test_cases: list[dict]) -> dict:
        """Run regression tests with scoring and threshold monitoring."""
```

#### **4. LangSmith Integration**
```python
# Dataset creation and management
client = Client()
dataset = client.create_dataset(dataset_name="qa-eval-dataset")

# Evaluation with custom evaluators
results = evaluate(
    qa_target,
    data=dataset_name,
    evaluators=[correctness, helpfulness, contains_answer],
    experiment_prefix="qa-chain-v1"
)
```

## 📋 Testing Demonstrations

### **Demo 1: Unit Testing with Mocks**

```python
def test_qa_chain_with_mock():
    """Test QA chain with mocked LLM."""
    
    # Create mock LLM
    mock_llm = Mock()
    mock_llm.invoke.return_value = AIMessage(content="Caracas")
    
    # Test with mock
    chain = QAChain(llm=mock_llm)
    result = chain.ask("What is the capital of France?")
    
    assert result == "Caracas"
    mock_llm.invoke.assert_called_once()
```

**Testing Features Demonstrated:**
- Mock LLM response configuration
- Deterministic test results
- Fast execution without API calls
- Verification of method calls

### **Demo 2: Integration Testing**

```python
class IntegrationTestSuite:
    """Integration tests with real LLM calls."""
    
    @traceable(name="integration_test")
    def test_basic_qa(self) -> dict:
        """Test basic question answering with real LLM."""
        
        test_cases = [
            {
                "question": "What is 2 + 2?",
                "expected_contains": ["4", "four"],
            },
            {
                "question": "What color is the sky on a clear day?",
                "expected_contains": ["blue"],
            },
        ]
        
        # Execute real LLM calls and validate responses
```

**Testing Features Demonstrated:**
- Real LLM API integration
- Response validation with multiple expected values
- Performance measurement
- Error handling with real responses

### **Demo 3: LLM-as-Judge Evaluation**

```python
def demo_evaluation():
    """Demonstrate LLM evaluation."""
    
    evaluator = LLMEvaluator()
    
    question = "Explain what machine learning is in simple terms."
    response = "Machine learning is when computers learn from data..."
    reference = "Machine learning is a type of artificial intelligence..."
    
    scores = evaluator.evaluate(question, response, reference)
    
    print("Scores:")
    for metric, score in scores.items():
        print(f"  {metric}: {score}/10")
```

**Testing Features Demonstrated:**
- Automated quality scoring
- Multi-dimensional evaluation (correctness, relevance, clarity, completeness)
- Reference-based comparison
- JSON parsing and error handling

### **Demo 4: Regression Testing**

```python
def demo_regression_testing():
    """Demonstrate regression testing."""
    
    def qa_chain(question: str) -> str:
        return llm.invoke(question).content
    
    test_cases = [
        {
            "input": "What is Python?",
            "expected": "Python is a programming language...",
        },
        {"input": "What is 10 * 5?", "expected": "50"},
    ]
    
    runner = RegressionTestRunner(qa_chain)
    results = runner.run(test_cases)
    
    print(f"Passed: {results['passed']}/{results['total']}")
    print(f"Average Score: {results['average_score']:.1f}/10")
```

**Testing Features Demonstrated:**
- Automated regression testing
- Score threshold monitoring
- Historical quality tracking
- Detailed result analysis

### **Demo 5: LangSmith Evaluation Datasets**

```python
def create_eval_dataset():
    """Create a dataset with test cases in LangSmith."""
    
    dataset = client.create_dataset(
        dataset_name="qa-eval-dataset",
        description="Q&A evaluation dataset for testing our chain",
    )
    
    examples = [
        {
            "inputs": {"question": "What is Python?"},
            "outputs": {"answer": "Python is a high-level programming language..."},
        },
        {"inputs": {"question": "What is 15 * 4?"}, "outputs": {"answer": "60"}},
        # ... more test cases
    ]
    
    for ex in examples:
        client.create_example(
            inputs=ex["inputs"], 
            outputs=ex["outputs"], 
            dataset_id=dataset.id
        )
```

**Testing Features Demonstrated:**
- Persistent dataset creation
- Version-controlled test cases
- Structured input/output format
- Collaborative test management

## 🛠️ Technical Implementation

### **Dependencies**

```python
import pytest
import json
from unittest.mock import Mock, patch
from typing import Callable
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import AIMessage
from langsmith import traceable, Client
from langsmith.evaluation import evaluate
from dotenv import load_dotenv
```

### **Environment Setup**

```bash
# Required environment variables
OPENAI_API_KEY=your-openai-api-key          # For LLM calls
LANGSMITH_API_KEY=your-langsmith-api-key    # For evaluation datasets
LANGCHAIN_TRACING_V2=true                   # Enable LangSmith
LANGSMITH_PROJECT=testing_patterns          # Project organization
```

### **LangSmith Integration**

```python
# Initialize client
client = Client()

# Create evaluation datasets
dataset = client.create_dataset(
    dataset_name="qa-eval-dataset",
    description="Q&A evaluation dataset"
)

# Run evaluations with custom evaluators
results = evaluate(
    qa_target,
    data=dataset_name,
    evaluators=[correctness, helpfulness, contains_answer],
    experiment_prefix="qa-chain-v1",
    max_concurrency=2
)
```

### **Custom Evaluators**

```python
def correctness(run, example) -> dict:
    """LLM-as-judge evaluator for correctness."""
    prediction = run.outputs.get("answer", "")
    reference = example.outputs.get("answer", "")
    question = example.inputs.get("question", "")
    
    # Use LLM to grade correctness
    result = eval_llm.invoke(grade_prompt.format(
        question=question, 
        submission=prediction, 
        reference=reference
    ))
    
    score = 1.0 if result.content.strip().upper() == "Y" else 0.0
    return {"key": "correctness", "score": score}

def helpfulness(run, example) -> dict:
    """LLM-as-judge evaluator for helpfulness."""
    # Evaluate without reference answer
    
def contains_answer(run, example) -> dict:
    """Custom evaluator - keyword matching."""
    # Simple keyword-based evaluation
```

## 📊 LangSmith Dataset Example

### **Live Dataset Demonstration**

🔗 **View Live Dataset**: [LangSmith Dataset Example](https://smith.langchain.com/public/448f53b8-917a-4c0b-ba95-5e8029bdfe98/d)

This public dataset demonstrates:

#### **Dataset Structure**
```json
{
  "name": "qa-eval-dataset",
  "description": "Q&A evaluation dataset for testing our chain",
  "examples": [
    {
      "inputs": {"question": "What is Python?"},
      "outputs": {"answer": "Python is a high-level programming language..."}
    },
    {
      "inputs": {"question": "What is 15 * 4?"},
      "outputs": {"answer": "60"}
    }
    // ... more test cases
  ]
}
```

#### **Experiment Comparison**
- **Experiment 1**: Basic prompt template
- **Experiment 2**: Enhanced prompt with detailed instructions
- **Metrics**: Correctness, Helpfulness, Keyword Matching
- **Results**: Side-by-side comparison with detailed scoring

#### **Evaluation Metrics**
| Metric | Description | Scoring Method |
|--------|-------------|----------------|
| **Correctness** | Factual accuracy against reference | LLM-as-judge (Y/N) |
| **Helpfulness** | Response clarity and usefulness | LLM-as-judge (Y/N) |
| **Contains Answer** | Keyword overlap with expected answer | Custom algorithm (0-1) |

#### **Key Features Demonstrated**
- ✅ **Persistent Storage**: Test cases saved and versioned
- ✅ **Experiment Tracking**: Multiple runs with comparison
- ✅ **Custom Evaluators**: Domain-specific evaluation logic
- ✅ **Collaborative Testing**: Share datasets across teams
- ✅ **Production Monitoring**: Continuous evaluation capabilities

---

## 📈 Testing Metrics and Observability

### **LangSmith Integration Benefits**

- **Traced Testing**: All test runs are traced in LangSmith
- **Performance Metrics**: Response times, token usage, costs
- **Quality Tracking**: Score trends over time
- **Error Analysis**: Detailed error tracking and categorization
- **Experiment Comparison**: Side-by-side model and prompt comparisons

### **Quality Metrics Dashboard**

```python
# Example metrics collection
testing_metrics = {
    "unit_tests_passed": 45,
    "unit_tests_total": 45,
    "integration_tests_passed": 8,
    "integration_tests_total": 10,
    "average_evaluation_score": 8.2,
    "regression_test_score": 7.8,
    "llm_api_calls": 25,
    "total_tokens_used": 15420,
    "average_response_time": 1.2,  # seconds
}
```

### **Continuous Quality Monitoring**

```python
def monitor_quality_threshold(results: dict):
    """Monitor quality against predefined thresholds."""
    
    thresholds = {
        "min_correctness": 0.8,
        "min_helpfulness": 0.7,
        "min_overall_score": 7.0,
        "max_response_time": 2.0,  # seconds
    }
    
    alerts = []
    
    if results["average_correctness"] < thresholds["min_correctness"]:
        alerts.append("Correctness below threshold")
    
    if results["average_response_time"] > thresholds["max_response_time"]:
        alerts.append("Response time too slow")
    
    return alerts
```

## 🎓 Learning Outcomes

After working through this project, you'll understand:

- ✅ **Unit Testing**: Mock-based testing for LLM applications
- ✅ **Integration Testing**: Real LLM testing strategies and patterns
- ✅ **LLM-as-Judge**: Automated evaluation using LLMs as evaluators
- ✅ **Regression Testing**: Quality tracking and change impact analysis
- ✅ **LangSmith Integration**: Production evaluation datasets and monitoring
- ✅ **Custom Evaluators**: Domain-specific evaluation logic implementation
- ✅ **Testing Architecture**: Multi-layer testing strategies for LLM apps
- ✅ **Quality Assurance**: Comprehensive quality assurance frameworks

## 🚀 Quick Start

### **Prerequisites**

- Python 3.12+
- OpenAI API key (for LLM calls)
- LangSmith API key (for evaluation datasets)
- Basic understanding of LangChain concepts

### **Installation**

```bash
# Clone and navigate to project
cd 71-langchain-testing-patterns

# Install dependencies
uv sync

# Or install manually
uv add langchain langchain-core langchain-openai langsmith pytest python-dotenv
```

### **Environment Setup**

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys
# OPENAI_API_KEY=your-openai-api-key
# LANGSMITH_API_KEY=your-langsmith-api-key
# LANGCHAIN_TRACING_V2=true
# LANGSMITH_PROJECT=testing_patterns
```

### **Running the Testing Demos**

```bash
# Run all testing demonstrations
uv run python main.py

# Individual demos (edit main.py to call specific functions):
# uv run python main.py  # LangSmith evaluation by default

# Available demos:
# test_qa_chain_with_mock()           # Unit testing with mocks
# test_qa_chain_handles_empty_response()  # Edge case testing
# demo_integration_tests()            # Real LLM integration testing
# demo_evaluation()                  # LLM-as-judge evaluation
# demo_regression_testing()          # Regression testing framework
# LangSmith evaluation demos         # Production evaluation datasets
```

### **Viewing Test Results in LangSmith**

1. **Open LangSmith Dashboard**: [smith.langchain.com](https://smith.langchain.com)
2. **Select Project**: Choose "testing_patterns"
3. **View Datasets**: Browse evaluation datasets and test cases
4. **Compare Experiments**: Analyze different model/prompt configurations
5. **Monitor Quality**: Track performance trends over time

## 🔧 Advanced Testing Features

### **Custom Test Framework**

```python
class CustomTestFramework:
    """Extensible testing framework for LLM applications."""
    
    def __init__(self):
        self.evaluators = []
        self.test_suites = []
        self.quality_thresholds = {}
    
    def add_evaluator(self, evaluator: Callable):
        """Add custom evaluator."""
        self.evaluators.append(evaluator)
    
    def add_test_suite(self, test_suite: dict):
        """Add test suite with cases and expected outputs."""
        self.test_suites.append(test_suite)
    
    def run_comprehensive_tests(self) -> dict:
        """Run all tests and generate comprehensive report."""
        # Implementation for comprehensive testing
        pass
```

### **Performance Testing**

```python
class PerformanceTestSuite:
    """Performance and load testing for LLM applications."""
    
    def benchmark_response_times(self, test_cases: list[dict]) -> dict:
        """Benchmark response times under different loads."""
        
    def stress_test_concurrent_requests(self, concurrency: int) -> dict:
        """Stress test with concurrent requests."""
        
    def measure_token_efficiency(self, prompt_variants: list[str]) -> dict:
        """Measure token usage efficiency across prompt variants."""
```

### **A/B Testing Framework**

```python
class ABTestFramework:
    """A/B testing for model and prompt comparisons."""
    
    def run_ab_test(self, variant_a: Callable, variant_b: Callable, 
                   test_cases: list[dict]) -> dict:
        """Run A/B test between two variants."""
        
    def statistical_significance(self, results_a: list, results_b: list) -> dict:
        """Calculate statistical significance of A/B test results."""
```

## 🎯 Production Testing Best Practices

### **1. Multi-Layer Testing Strategy**

- **Unit Tests**: Fast, isolated component testing with mocks
- **Integration Tests**: Real API testing for critical workflows
- **Evaluation Tests**: Automated quality assessment with LLM-as-judge
- **Regression Tests**: Continuous quality monitoring over time
- **Production Monitoring**: Real-time performance and quality tracking

### **2. Test Data Management**

- **Version Control**: Track test cases and expected outputs
- **Data Privacy**: Ensure no sensitive data in test datasets
- **Synthetic Data**: Generate realistic test data when needed
- **Golden Sets**: Maintain curated high-quality test cases
- **Continuous Updates**: Regularly update test cases with new scenarios

### **3. Quality Thresholds**

- **Minimum Scores**: Define acceptable quality thresholds
- **Performance SLAs**: Set response time and availability targets
- **Error Rates**: Monitor and limit error rates in production
- **Cost Monitoring**: Track and optimize API usage costs
- **User Satisfaction**: Measure and track user satisfaction metrics

### **4. Continuous Integration**

- **Automated Testing**: Run tests on every code change
- **Quality Gates**: Block deployments if quality thresholds not met
- **Regression Detection**: Automatically detect quality regressions
- **Performance Monitoring**: Continuous performance tracking
- **Alert Systems**: Automated alerts for quality issues

## 📚 Testing Concepts Covered

- **Unit Testing**: Isolated component testing with mocks and stubs
- **Integration Testing**: End-to-end testing with real dependencies
- **LLM-as-Judge**: Using LLMs to evaluate LLM outputs automatically
- **Regression Testing**: Monitoring quality changes over time
- **Evaluation Datasets**: Persistent test case management
- **Custom Evaluators**: Domain-specific evaluation logic
- **A/B Testing**: Comparing different models and prompts
- **Performance Testing**: Load and stress testing for LLM applications

## 🔮 Advanced Testing Patterns

### **Behavioral Testing**
- **User Journey Testing**: Test complete user workflows
- **Conversation Testing**: Multi-turn conversation validation
- **Context Management**: Test context preservation across interactions
- **Error Recovery**: Test error handling and recovery mechanisms

### **Adaptive Testing**
- **Dynamic Test Generation**: Generate tests based on usage patterns
- **Self-Healing Tests**: Tests that adapt to minor changes
- **Intelligent Test Selection**: Choose relevant tests based on changes
- **Predictive Quality**: Predict quality issues before deployment

### **Cross-Model Testing**
- **Model Comparison**: Test across different LLM providers
- **Version Testing**: Test new model versions before rollout
- **Fallback Testing**: Test fallback mechanisms and error handling
- **Cost Optimization**: Test cost-effective model usage patterns

## 🤝 Extending the Testing Framework

This project provides a foundation for LLM testing that can be extended with:

- **Domain-Specific Evaluators**: Custom evaluation logic for specific use cases
- **Integration with CI/CD**: Automated testing in deployment pipelines
- **Advanced Analytics**: Machine learning for test result analysis
- **Multi-Modal Testing**: Testing for text, image, and audio inputs
- **Distributed Testing**: Scale testing across multiple environments

## 📄 License

This project is educational and demonstrates testing patterns for learning and reference purposes. Use these patterns as a foundation for building comprehensive testing strategies for LLM applications.

---

**Built with Quality First** - Production-ready testing patterns for reliable LLM applications.
