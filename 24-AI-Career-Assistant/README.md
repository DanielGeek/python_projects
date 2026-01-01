# 🤖 Daniel's AI Career Assistant

An intelligent chatbot powered by Google Gemini models that acts as Daniel Ángel Barreto's AI assistant, showcasing his expertise in Python, AI/ML, and Blockchain development.

## ✨ Features

### 🎯 Core Functionality

- **Multi-Model AI Chat**: Intelligent conversation using Google's free Gemini models
- **Career Showcase**: Displays Daniel's 12+ years of experience in software development
- **Smart Tool Integration**: Automatically detects and processes various user intents

### 🔄 Advanced API Management

- **4-Model Rotation**: Automatic switching between Gemini models for optimal performance
  - `gemini-2.5-flash` (Best quality, hybrid reasoning)
  - `gemini-2.0-flash` (Multimodal, agent-ready)
  - `gemini-2.5-flash-lite` (Cost-effective, high throughput)
  - `gemini-2.0-flash-lite` (Fastest, most economical)
- **Smart Rate Limiting**: Exponential backoff with automatic retry logic
- **Usage Tracking**: Per-model usage counters with real-time monitoring

### 📱 Push Notifications

- **Session Tracking**: Unique session IDs for user interaction tracking
- **Real-time Alerts**: Instant notifications for:
  - Unknown questions requiring attention
  - Contact requests with user details
  - Job offers with compensation information
- **API Usage Stats**: Complete usage analytics included in every notification

### 🎨 Modern UI/UX

- **Gradio Interface**: Clean, responsive web interface
- **Enhanced Visibility**: Optimized color scheme for better readability
- **Professional Design**: Tailored for professional networking

## 🛠️ Technical Architecture

### API Management System

- **Rotation Logic**: Automatic key and model switching on quota exhaustion
- **Backoff Strategy**: Exponential backoff (1min → 30min) for rate limiting
- **Usage Monitoring**: Real-time tracking per model+key combination
- **Error Recovery**: Comprehensive error handling with automatic retry

### Tool Functions
The chatbot includes intelligent tool detection:

1. **`record_unknown_question`** - Captures questions outside Daniel's expertise
2. **`record_user_details`** - Handles contact information and networking requests
3. **`record_job_offer`** - Processes job opportunities with compensation details

### Session Management

- **Unique Sessions**: UUID-based session tracking
- **Context Preservation**: Session data included in all notifications
- **User Analytics**: Complete interaction tracking for follow-up

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Google Gemini API keys (4 keys for rotation)
- Pushover account for notifications (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/DanielGeek/python_projects.git
cd python_projects/24-AI-Career-Assistant

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys
```

### Environment Configuration

Create a `.env` file with the following variables:

```env
# Google Gemini API Keys (4 keys for rotation)
GOOGLE_API_KEY=your_first_gemini_api_key
GOOGLE_API_KEY2=your_second_gemini_api_key
GOOGLE_API_KEY3=your_third_gemini_api_key
GOOGLE_API_KEY4=your_fourth_gemini_api_key

# Pushover Notifications (optional)
PUSHOVER_TOKEN=your_pushover_app_token
PUSHOVER_USER=your_pushover_user_key
```

### Running the Application

```bash
# Start the chatbot
python daniel-chatbot.py

# Or using uv (recommended)
uv run daniel-chatbot.py
```

The application will be available at:

- **Local**: http://127.0.0.1:7860
- **Public**: <https://[random-id].gradio.live> (temporary)

## 📊 Usage Monitoring

### Real-time Stats

The system displays comprehensive usage statistics:

```text
🤖 Current Model: gemini-2.5-flash
🔑 Current Key: 3

Key 1: 20/20 used ⚠️ (1/4 models exhausted) (resets in 23h 59m)
Key 2: 15/20 used ✅
Key 3: 3/20 used ✅
Key 4: 0/20 used ✅
```

### Push Notification Example

```
❓ Unknown Question

Question: What's your experience with quantum computing?

========================================
📍 Session Tracking:
• Session ID: a1b2c3d4...
• Timestamp: 2025-12-31 19:27:15

🔑 Gemini API Usage:
🤖 Current Model: gemini-2.5-flash
🔑 Current Key: 3

Key 1: 20/20 used ⚠️ (1/4 models exhausted)
Key 2: 15/20 used ✅
Key 3: 3/20 used ✅
Key 4: 0/20 used ✅
```

## 🔧 Configuration Options

### Model Priority

Models are ordered by quality and capabilities:

1. **gemini-2.5-flash** - Best overall performance
2. **gemini-2.0-flash** - Multimodal capabilities
3. **gemini-2.5-flash-lite** - Balanced performance/cost
4. **gemini-2.0-flash-lite** - Maximum throughput

### Rate Limits

- **Daily Limit**: 20 requests per key per model
- **Reset Interval**: 24 hours
- **Backoff Strategy**: 1min → 2min → 4min → ... → 30min max

## 🎯 Use Cases

### For Daniel Ángel Barreto

- **Professional Networking**: Automated response to career inquiries
- **Job Opportunities**: Immediate notification of relevant positions
- **Knowledge Gap Analysis**: Identify topics to expand expertise

### For Recruiters/Networkers

- **Instant Information**: Quick access to Daniel's background and skills
- **Direct Contact**: Seamless connection for opportunities
- **Expertise Showcase**: Interactive demonstration of technical knowledge

## 🤝 Contributing

This project serves as Daniel's professional AI assistant. Contributions for improvements and new features are welcome.

### Development Setup

```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Run with debug mode
python daniel-chatbot.py --debug
```

## 📄 License

This project is part of Daniel Ángel Barreto's professional portfolio and showcases his expertise in:
- **Python Development**: 12+ years experience
- **AI/ML Implementation**: Production-ready systems
- **API Integration**: Robust error handling and scaling
- **Modern UI/UX**: User-centered design principles

## 🔗 Connect with Daniel

- **LinkedIn**: [Daniel Ángel Barreto](https://linkedin.com/in/daniel-angel-barreto)
- **GitHub**: [DanielGeek](https://github.com/DanielGeek)
- **Email**: Through the chatbot's contact function

---

*Built with ❤️ using Google Gemini, Gradio, and modern Python practices*