# 23-AI-Agent: Multi-LLM Evaluation & Comparison System

An intelligent AI agent that compares responses from multiple language models (OpenAI, Google Gemini, Ollama) and includes a real-time evaluation system with automatic retry mechanisms.

## 🚀 Features

### **Multi-LLM Comparison**

- **OpenAI GPT-4o-mini**: Cloud-based model for comparison
- **Google Gemini 2.5 Flash**: Advanced reasoning with structured output
- **Ollama Llama3.2**: Local model for privacy and offline usage
- **Parallel Processing**: Simultaneous responses from all models

### **Real-Time Evaluation System**

- **Pydantic Validation**: Type-safe evaluation with structured outputs
- **Gemini-Powered Evaluator**: Intelligent response quality assessment
- **Automatic Retry**: Failed responses automatically improved with feedback
- **Visual Feedback**: Evaluation status displayed directly in chat interface
- **Transparent Process**: Users can see evaluation feedback and improvements

### **Interactive Chatbot with Gradio**

- **Modern Interface**: Updated to latest Gradio syntax with custom components
- **Real-Time Notifications**: In-chat evaluation status and feedback display
- **Markdown Formatting**: Rich text display with emojis and structured content
- **Experimental Features**: Pig Latin mode for specific query types

## 🏗️ Architecture

### **Core Components**

```text
23-AI-Agent/
├── main.py              # Multi-LLM comparison system
├── chatbot.py           # Interactive chatbot with evaluation
├── ollama-test.py       # Ollama testing script
├── .env.example         # Environment variables template
├── pyproject.toml       # Dependencies and project config
└── README.md            # This file
```

### **Evaluation Pipeline**

1. **Initial Response**: Generate response from primary LLM
2. **Quality Evaluation**: Gemini evaluates response quality
3. **Success Path**: If acceptable, display with ✅ status
4. **Retry Path**: If failed, show feedback and regenerate
5. **Final Display**: Show evaluation status and improved response

## 🛠️ Technical Implementation

### **Dependencies**

```toml
[dependencies]
openai = "2.14.0"
google-genai = "1.56.0"
anthropic = "0.75.0"
gradio = "6.2.0"
pydantic = "2.12.5"
python-dotenv = "1.2.1"
ipython = "9.8.0"
```

### **Multi-LLM Integration**

#### **OpenAI Integration**

```python
openai = OpenAI()
response = openai.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages
)
answer = response.choices[0].message.content
```

#### **Google Gemini Integration**

```python
from google import genai
google_client = genai.Client(api_key=google_api_key)
response = google_client.models.generate_content(
    model="gemini-2.5-flash",
    contents=question
)
answer = response.candidates[0].content.parts[0].text
```

#### **Ollama Local Integration**

```python
ollama_client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
response = ollama_client.chat.completions.create(
    model="llama3.2",
    messages=messages
)
answer = response.choices[0].message.content
```

### **Evaluation System**

#### **Pydantic Model**

```python
class Evaluation(BaseModel):
    is_acceptable: bool
    feedback: str
```

#### **Gemini Evaluator**

```python
def evaluate(reply, message, history) -> Evaluation:
    messages = [
        {"role": "system", "content": evaluator_system_prompt},
        {"role": "user", "content": evaluator_user_prompt(reply, message, history)}
    ]
    response = gemini.beta.chat.completions.parse(
        model="gemini-2.5-flash", 
        messages=messages, 
        response_format=Evaluation
    )
    return response.choices[0].message.parsed
```

#### **Retry Mechanism**

```python
def rerun(reply, message, history, feedback):
    updated_system_prompt = system_prompt + "\n\n## Previous answer rejected\n"
    updated_system_prompt += f"## Your attempted answer:\n{reply}\n\n"
    updated_system_prompt += f"## Reason for rejection:\n{feedback}\n\n"
    messages = [{"role": "system", "content": updated_system_prompt}] + history + [{"role": "user", "content": message}]
    response = openai.chat.completions.create(model="gpt-4o-mini", messages=messages)
    return response.choices[0].message.content
```

### **Gradio Interface**

#### **Modern ChatInterface**

```python
gr.ChatInterface(
    chat,
    title="AI Agent with Evaluation",
    description="Chat with real-time response evaluation",
    chatbot=gr.Chatbot(height=600, placeholder="Ask me anything..."),
    textbox=gr.Textbox(placeholder="Type your message here...", container=False, scale=7),
    submit_btn="Send"
).launch()
```

#### **In-Chat Evaluation Display**

```python
def chat(message, history):
    # ... generate response ...
    evaluation = evaluate(reply, message, history)
    
    if evaluation.is_acceptable:
        final_reply = f"✅ **Evaluation: Passed**\n\n{reply}"
    else:
        feedback_msg = f"⚠️ **Evaluation: Failed**\n**Feedback:** {evaluation.feedback}\n\n🔄 **Retrying...**"
        reply = rerun(reply, message, history, evaluation.feedback)
        final_reply = f"{feedback_msg}\n\n---\n\n✅ **Revised Answer:**\n\n{reply}"
    
    return final_reply
```

## 🚀 Quick Start

### **Prerequisites**

- Python 3.14+
- OpenAI API key
- Google API key
- Ollama installed and running (for local model)

### **Installation**

1. **Clone and setup environment**

```bash
cd /Users/thepunisher/Documents/GitHub/python_projects/23-AI-Agent
uv sync
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. **Configure environment variables**

```bash
cp .env.example .env
# Edit .env with your API keys:
# OPENAI_API_KEY=your-openai-api-key
# GOOGLE_API_KEY=your-google-api-key
```

3. **Setup Ollama (optional)**

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull Llama3.2 model
ollama pull llama3.2

# Start Ollama server
ollama serve
```

### **Usage Examples**

#### **Multi-LLM Comparison**

```bash
uv run main.py
```

Output:

```text
OpenAI API key exists and begins sk-proj-
Google API key exists and begins AIzaSy-

==================================================
QUESTION:
==================================================
What are the key differences between supervised and unsupervised learning?

==================================================
ANSWER FROM GPT-4O-MINI:
==================================================
[OpenAI response...]

==================================================
ANSWER FROM GEMINI-2.5-FLASH:
==================================================
[Gemini response...]

==================================================
ANSWER FROM LLAMA3.2:
==================================================
[Ollama response...]
```

#### **Interactive Chatbot with Evaluation**

```bash
uv run chatbot.py
```
Launches web interface at `http://localhost:7860`

#### **Ollama Testing**

```bash
uv run ollama-test.py
```

## 📊 Evaluation Features

### **Quality Assessment**

- **Professional Tone**: Evaluates appropriateness for business context
- **Accuracy**: Checks factual correctness based on provided context
- **Engagement**: Assesses conversational quality and user engagement
- **Persona Consistency**: Ensures responses match character requirements

### **Visual Feedback**

- **✅ Passed**: Green checkmark for approved responses
- **⚠️ Failed**: Warning with specific feedback
- **🔄 Retrying**: Indication when response is being improved
- **--- Separator**: Clear division between feedback and revised answers

### **Experimental Features**

- **Pig Latin Mode**: Automatic language transformation for specific keywords
- **Context Injection**: Dynamic persona and background integration
- **Multi-turn Memory**: Maintains conversation history for context

## 🔧 Configuration

### **Environment Variables**

| Variable         | Description               | Required |
| ---------------- | ------------------------- | -------- |
| `OPENAI_API_KEY` | OpenAI API authentication | Yes      |
| `GOOGLE_API_KEY` | Google Gemini API key     | Yes      |

### **Model Configuration**

#### **Available Models**

- **OpenAI**: `gpt-4o-mini` (fast, cost-effective)
- **Google Gemini**: `gemini-2.5-flash` (latest, structured output)
- **Ollama**: `llama3.2` (local, private)

#### **Customization Options**

```python
# Change models in main.py
openai_model = "gpt-4o-mini"
gemini_model = "gemini-2.5-flash"
ollama_model = "llama3.2"

# Adjust evaluation criteria
evaluator_system_prompt += "Additional evaluation criteria..."
```

## 🧪 Development & Testing

### **Testing Individual Components**

```bash
# Test Ollama connection
uv run ollama-test.py

# Test multi-LLM comparison
uv run main.py

# Test chatbot with evaluation
uv run chatbot.py
```

### **Debug Mode**

Enable verbose logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🚀 Deployment

### **Production Considerations**

- **API Rate Limits**: Implement request throttling
- **Error Handling**: Comprehensive exception management
- **Security**: API key protection and input validation
- **Scalability**: Async processing for concurrent users

### **Docker Support**

```dockerfile
FROM python:3.14-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
EXPOSE 7860
CMD ["gradio", "chatbot.py"]
```

## 🔒 Security & Privacy

- **API Key Protection**: Environment-based configuration
- **Local Processing**: Ollama models run entirely locally
- **Input Validation**: Sanitization of user inputs
- **Rate Limiting**: Built-in protection against API abuse

## 🤝 Contributing

### **Development Guidelines**

1. Follow PEP 8 style conventions
2. Add comprehensive docstrings
3. Include error handling for all API calls
4. Update documentation for new features
5. Test with multiple model configurations

### **Feature Ideas**

- [ ] Add more LLM providers (Claude, Cohere)
- [ ] Implement conversation export/import
- [ ] Add evaluation metrics dashboard
- [ ] Support for custom evaluation criteria
- [ ] Integration with vector databases for context

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI**: GPT-4o-mini model access
- **Google**: Gemini 2.5 Flash with structured output
- **Ollama**: Local model hosting infrastructure
- **Gradio**: Modern web interface framework
- **Pydantic**: Data validation and structured outputs

### **Support**

For questions, issues, or contributions:
- Create an issue in the project repository
- Review the API documentation for each integration
- Check the configuration examples in this README

---

## 🙏 Acknowledgments

**Built with ❤️ using Python, OpenAI, Google Gemini, and modern AI technologies**
