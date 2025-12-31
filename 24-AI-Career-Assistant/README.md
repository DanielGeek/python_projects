# 24-AI-Career-Assistant: Professional AI Career Assistant with Tool Use

An intelligent AI assistant that acts as a professional career representative, featuring tool use capabilities, real-time push notifications, and contextual responses based on personal resume and LinkedIn data.

## 🚀 Features

### **Professional AI Assistant**

- **Career Representation**: Acts as a professional representative for career-related interactions
- **Context-Aware Responses**: Integrates personal resume and LinkedIn profile data
- **Professional Tone**: Engages with potential clients and employers appropriately
- **Business Development**: Steers conversations toward professional connections

### **Tool Use Architecture**

- **Function Calling**: OpenAI-powered tool calling for extensible functionality
- **User Interest Recording**: Captures email addresses and conversation context
- **Question Tracking**: Records unanswered questions for follow-up
- **Dynamic Tool Resolution**: Elegant system for adding new tools without code changes

### **Real-Time Notifications**

- **Pushover Integration**: Instant mobile notifications for user interactions
- **Real-Time Alerts**: Immediate notification when users express interest or ask questions
- **Mobile Accessibility**: Monitor career assistant activity from anywhere

### **Document Processing**

- **PDF Resume Parsing**: Extracts professional information from PDF resumes
- **LinkedIn Integration**: Processes LinkedIn profile data for context
- **Text Summarization**: Integrates personal summary for enhanced responses

## 🏗️ Architecture

### **Core Components**

```text
24-AI-Career-Assistant/
├── main.py              # Main application with Me class and chat interface
├── me/                  # Personal data directory
│   ├── DanielGeek.pdf  # Professional resume/CV
│   └── summary.txt     # Personal summary
├── .env.example         # Environment variables template
├── pyproject.toml       # Dependencies and project config
└── README.md            # This file
```

### **Class-Based Architecture**

```python
class Me:
    def __init__(self):
        self.openai = OpenAI()
        self.name = "Daniel Ángel Barreto"
        self.linkedin = self._parse_pdf_resume()
        self.summary = self._load_summary()
    
    def system_prompt(self):
        # Generates contextual system prompt with personal data
    
    def handle_tool_call(self, tool_calls):
        # Processes OpenAI tool calls dynamically
    
    def chat(self, message, history):
        # Main chat function with tool calling support
```

## 🛠️ Technical Implementation

### **Dependencies**
```toml
[dependencies]
openai = "2.14.0"
python-dotenv = "1.2.1"
requests = "2.32.5"
pypdf = "6.5.0"
gradio = "6.2.0"
anthropic = "0.75.0"
google-genai = "1.56.0"
ipython = "9.8.0"
```

### **Tool Use Implementation**

#### **Tool Definitions**
```python
record_user_details_json = {
    "name": "record_user_details",
    "description": "Use this tool to record that a user is interested in being in touch",
    "parameters": {
        "type": "object",
        "properties": {
            "email": {"type": "string", "description": "The user's email address"},
            "name": {"type": "string", "description": "The user's name"},
            "notes": {"type": "string", "description": "Additional context information"}
        },
        "required": ["email"],
        "additionalProperties": False
    }
}

record_unknown_question_json = {
    "name": "record_unknown_question",
    "description": "Record any question that couldn't be answered",
    "parameters": {
        "type": "object",
        "properties": {
            "question": {"type": "string", "description": "The unanswered question"}
        },
        "required": ["question"],
        "additionalProperties": False
    }
}
```

#### **Dynamic Tool Call Handler**
```python
def handle_tool_call(self, tool_calls):
    results = []
    for tool_call in tool_calls:
        tool_name = tool_call.function.name
        arguments = json.loads(tool_call.function.arguments)
        print(f"Tool called: {tool_name}", flush=True)
        tool = globals().get(tool_name)
        result = tool(**arguments) if tool else {}
        results.append({
            "role": "tool",
            "content": json.dumps(result),
            "tool_call_id": tool_call.id
        })
    return results
```

### **Pushover Integration**

#### **Notification System**
```python
def push(text):
    requests.post(
        "https://api.pushover.net/1/messages.json",
        data={
            "token": os.getenv("PUSHOVER_TOKEN"),
            "user": os.getenv("PUSHOVER_USER"),
            "message": text,
        }
    )

def record_user_details(email, name="Name not provided", notes="not provided"):
    push(f"Recording {name} with email {email} and notes {notes}")
    return {"recorded": "ok"}

def record_unknown_question(question):
    push(f"Recording {question}")
    return {"recorded": "ok"}
```

### **OpenAI Tool Calling**

#### **Chat Function with Tools**
```python
def chat(self, message, history):
    messages = [
        {"role": "system", "content": self.system_prompt()}
    ] + history + [{"role": "user", "content": message}]
    
    done = False
    while not done:
        response = self.openai.chat.completions.create(
            model="gpt-4o-mini", 
            messages=messages, 
            tools=tools
        )
        
        if response.choices[0].finish_reason == "tool_calls":
            message = response.choices[0].message
            tool_calls = message.tool_calls
            results = self.handle_tool_call(tool_calls)
            messages.append(message)
            messages.extend(results)
        else:
            done = True
    
    return response.choices[0].message.content
```

### **Document Processing**

#### **PDF Resume Parser**
```python
def __init__(self):
    reader = PdfReader("me/DanielGeek.pdf")
    self.linkedin = ""
    for page in reader.pages:
        text = page.extract_text()
        if text:
            self.linkedin += text
```

#### **System Prompt Generation**
```python
def system_prompt(self):
    system_prompt = f"You are acting as {self.name}. You are answering questions on {self.name}'s website, \
    particularly questions related to {name}'s career, background, skills and experience. \
    Your responsibility is to represent {name} for interactions on the website as faithfully as possible. \
    You are given a summary of {name}'s background and LinkedIn profile which you can use to answer questions. \
    Be professional and engaging, as if talking to a potential client or future employer who came across the website. \
    If you don't know the answer to any question, use your record_unknown_question tool to record the question that you couldn't answer, even if it's about something trivial or unrelated to career. \
    If the user is engaging in discussion, try to steer them towards getting in touch via email; ask for their email and record it using your record_user_details tool. "
    
    system_prompt += f"\n\n## Summary:\n{self.summary}\n\n## LinkedIn Profile:\n{self.linkedin}\n\n"
    system_prompt += f"With this context, please chat with the user, always staying in character as {self.name}."
    return system_prompt
```

### **Gradio Interface**

#### **Modern Chat Interface**
```python
if __name__ == "__main__":
    me = Me()
    gr.ChatInterface(
        me.chat,
        title="Career Assistant", 
        description="Chat with a career assistant",
        chatbot=gr.Chatbot(height=600, placeholder="Ask me anything..."),
        textbox=gr.Textbox(placeholder="Type your message here...", container=False, scale=7),
        submit_btn="Send"
    ).launch()
```

## 🚀 Quick Start

### **Prerequisites**
- Python 3.14+
- OpenAI API key
- Pushover account and API keys
- Personal resume PDF and summary file

### **Installation**

1. **Clone and setup environment**
```bash
cd /Users/thepunisher/Documents/GitHub/python_projects/24-AI-Career-Assistant
uv sync
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your API keys:
# OPENAI_API_KEY=your-openai-api-key
# PUSHOVER_USER=your-pushover-user-key
# PUSHOVER_TOKEN=your-pushover-app-token
```

3. **Setup Pushover**
```bash
# Visit https://pushover.net/ and sign up
# Create an application to get your API token
# Install Pushover app on your phone
# Add your user key and app token to .env file
```

4. **Prepare personal data**
```bash
# Add your resume PDF to me/DanielGeek.pdf
# Create me/summary.txt with your professional summary
# Update name in the Me class to match your name
```

### **Usage Examples**

#### **Launch Career Assistant**
```bash
uv run main.py
```
Launches web interface at `http://localhost:7860`

#### **Example Interactions**
- **Career Questions**: "What experience do you have with AI projects?"
- **Business Inquiries**: "I'm interested in discussing a potential collaboration"
- **Contact Capture**: "How can I reach you for consulting opportunities?"

## 📊 Tool Use Features

### **Available Tools**

#### **record_user_details**
- **Purpose**: Capture user interest and contact information
- **Triggers**: When users express interest in collaboration or contact
- **Data**: Email, name, and conversation context
- **Notification**: Instant push notification with user details

#### **record_unknown_question**
- **Purpose**: Log questions that cannot be answered from available context
- **Triggers**: When asked about information not in resume/profile
- **Data**: The specific unanswered question
- **Notification**: Push notification for follow-up research

### **Tool Calling Flow**

1. **User Input**: "Hi, I'm John and I'm interested in AI consulting"
2. **OpenAI Analysis**: Detects interest and contact information
3. **Tool Call**: `record_user_details(email="john@example.com", name="John", notes="AI consulting interest")`
4. **Push Notification**: Instant alert on phone
5. **Response**: Professional follow-up with next steps

## 🔧 Configuration

### **Environment Variables**

| Variable         | Description                | Required |
| ---------------- | -------------------------- | -------- |
| `OPENAI_API_KEY` | OpenAI API authentication  | Yes      |
| `PUSHOVER_USER`  | Pushover user key          | Yes      |
| `PUSHOVER_TOKEN` | Pushover application token | Yes      |

### **Personal Data Setup**

#### **Resume PDF**
- Place in `me/DanielGeek.pdf`
- Should contain professional experience, skills, and background
- Used for LinkedIn profile context extraction

#### **Summary Text**
- Create `me/summary.txt`
- Professional summary highlighting key expertise
- Integrated into system prompt for contextual responses

#### **Name Configuration**
```python
class Me:
    def __init__(self):
        self.name = "Daniel Ángel Barreto"  # Update to your name
```

## 🧪 Development & Testing

### **Testing Tool Calls**
```python
# Test individual tools
globals()["record_unknown_question"]("Test question")
globals()["record_user_details"]("test@example.com", "Test User", "Test notes")
```

### **Debug Mode**
```python
# Enable verbose output
print(f"Tool called: {tool_name}", flush=True)
print(f"Push: {message}")
```

### **Tool Extension**
```python
# Add new tools without modifying handle_tool_call
def new_tool(param1, param2):
    # Tool implementation
    return {"result": "success"}

# Add to tools list
tools.append({"type": "function", "function": new_tool_json})
```

## 🚀 Deployment

### **HuggingFace Spaces Deployment**

1. **Prepare for deployment**
```bash
# Ensure all secrets are configured
# Update personal data in me/ directory
# Test locally first
```

2. **Deploy to HuggingFace**
```bash
uv tool install 'huggingface_hub[cli]'
hf auth login --token YOUR_HF_TOKEN
uv run gradio deploy
```

3. **Configure deployment secrets**
- `OPENAI_API_KEY`: Your OpenAI API key
- `PUSHOVER_USER`: Your Pushover user key
- `PUSHOVER_TOKEN`: Your Pushover app token

### **Production Considerations**
- **Rate Limiting**: Implement API request throttling
- **Error Handling**: Comprehensive exception management
- **Security**: API key protection and input validation
- **Monitoring**: Push notification tracking and analytics

## 🔒 Security & Privacy

- **API Key Protection**: Environment-based configuration
- **Data Privacy**: Personal data stored locally
- **Input Validation**: Sanitization of user inputs
- **Push Security**: Encrypted notification delivery

## 🤝 Contributing

### **Development Guidelines**
1. Follow PEP 8 style conventions
2. Add comprehensive docstrings
3. Include error handling for all API calls
4. Update documentation for new tools
5. Test tool calling functionality

### **Feature Ideas**
- [ ] Add calendar integration for meeting scheduling
- [ ] Implement CRM integration for lead tracking
- [ ] Add multi-language support
- [ ] Create analytics dashboard for interactions
- [ ] Add voice interaction capabilities

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI**: GPT-4o-mini model with function calling
- **Pushover**: Real-time mobile notification service
- **Gradio**: Modern web interface framework
- **PyPDF**: PDF text extraction capabilities
- **Python**: Core programming language

## 📞 Support

For questions, issues, or contributions:
- Create an issue in the project repository
- Review the API documentation for each integration
- Check the configuration examples in this README

---

## 🙏 Acknowledgments

**Built with ❤️ using Python, OpenAI, and modern AI technologies**