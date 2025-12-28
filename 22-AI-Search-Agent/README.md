# 22-AI-Search-Agent

An intelligent multi-source research agent that leverages multiple search engines and social media platforms to provide comprehensive, well-analyzed answers to user queries.

## 🚀 Features

### **Multi-Source Intelligence Gathering**
- **Google Search**: Access to authoritative sources and official documentation
- **Bing Search**: Complementary perspectives and Microsoft ecosystem insights
- **Reddit Search**: Real user experiences, community discussions, and diverse opinions

### **Advanced Data Processing**
- **Structured Output**: Uses Pydantic models for type-safe data handling
- **LangGraph Integration**: Orchestrates complex multi-step research workflows
- **Google Gemini Integration**: State-of-the-art AI analysis and synthesis

### **Web Scraping Capabilities**
- **Bright Data Integration**: Professional-grade web scraping infrastructure
- **SERP API**: Real-time search engine results processing
- **Reddit API**: Complete post and comment extraction with metadata
- **Snapshot Management**: Asynchronous data collection with progress tracking

## 🏗️ Architecture

### **Core Components**

```text
22-AI-Search-Agent/
├── main.py                 # Main application and LangGraph workflow
├── web_operations.py       # Bright Data API integration
├── snapshot_operations.py  # Asynchronous data collection
├── prompts.py             # LLM prompt templates and message builders
├── .env.example           # Environment variables template
└── README.md              # This file
```

### **Workflow Pipeline**

1. **Parallel Search**: Simultaneous queries to Google, Bing, and Reddit
2. **URL Selection**: AI-powered identification of most relevant Reddit posts
3. **Content Retrieval**: Deep extraction of comments and discussions
4. **Multi-Source Analysis**: Individual analysis of each data source
5. **Synthesis**: Comprehensive answer combining all insights

## 🛠️ Technical Implementation

### **Dependencies**
- **LangChain**: AI/LLM integration and prompt management
- **LangGraph**: Workflow orchestration and state management
- **Google Gemini**: Advanced reasoning and analysis capabilities
- **Bright Data**: Professional web scraping and data collection
- **Pydantic**: Data validation and structured models
- **Requests**: HTTP client for API communications

### **API Integrations**

#### **Bright Data SERP API**
```python
# Search engine results extraction
google_results = serp_search(query, engine="google")
bing_results = serp_search(query, engine="bing")
```

#### **Reddit Data Collection**
```python
# Post discovery and comment extraction
reddit_posts = reddit_search_api(keyword)
reddit_comments = reddit_post_retrieval(selected_urls)
```

### **Structured Data Models**

```python
class State(TypedDict):
    user_question: str
    google_results: dict
    bing_results: dict
    reddit_results: dict
    selected_reddit_urls: List[str]
    reddit_post_data: List[dict]
    google_analysis: str
    bing_analysis: str
    reddit_analysis: str
    final_answer: str

class RedditURLAnalysis(BaseModel):
    selected_urls: List[str] = Field(
        description="List of Reddit URLs containing valuable information"
    )
```

## 🚀 Quick Start

### **Prerequisites**
- Python 3.14+
- Bright Data account with API access
- Google API key for Gemini integration

### **Installation**

1. **Clone and setup environment**
```bash
cd /Users/thepunisher/Documents/GitHub/python_projects/22-AI-Search-Agent
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv install -r pyproject.toml
```

2. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your API keys:
# BRIGHTDATA_API_KEY=your-brightdata-api-key
# POSTS_DATASET_ID=your-reddit-posts-dataset-id
# COMMENTS_DATASET_ID=your-reddit-comments-dataset-id
# GOOGLE_API_KEY=your-google-api-key
```

3. **Run the application**
```bash
uv run python main.py
```

### **Usage Example**

```
Multi-Source Research Agent
Type 'exit' to quit

Ask me anything: invest in NVIDIA

 Starting parallel research process...
Launching Google, Bing, and Reddit searches...

Searching Google for: invest in NVIDIA
Searching Bing for: invest in NVIDIA
Searching Reddit for: invest in NVIDIA

✅ Snapshot completed!
🎉 Successfully downloaded 72 items

Selected URLs:
   1. https://www.reddit.com/r/NvidiaStock/comments/...
   2. https://www.reddit.com/r/LocalLLaMA/comments/...

Getting reddit post comments
Processing 7 Reddit URLs
✅ Snapshot completed!
🎉 Successfully downloaded 245 comments

Analyzing google search results...
Analyzing bing search results...
Analyzing reddit search results...
Combine all results together

 Final Answer:
[Comprehensive analysis combining data from all sources...]

--------------------------------------------------------------------------------
```

## 📊 Performance & Scalability

### **Optimizations**
- **Parallel Processing**: Simultaneous multi-source data collection
- **Asynchronous Operations**: Non-blocking snapshot polling and downloads
- **Intelligent Caching**: Avoid duplicate API calls for identical queries
- **Progress Tracking**: Real-time feedback on long-running operations

### **Rate Limits & Quotas**
- **Bright Data**: Configurable retry logic and timeout handling
- **Google Gemini**: Token-efficient prompt design
- **Reddit API**: Batch processing for multiple URLs

## 🔧 Configuration

### **Environment Variables**

| Variable | Description | Required |
|----------|-------------|----------|
| `BRIGHTDATA_API_KEY` | Bright Data API authentication | Yes |
| `POSTS_DATASET_ID` | Reddit posts dataset ID | Yes |
| `COMMENTS_DATASET_ID` | Reddit comments dataset ID | Yes |
| `GOOGLE_API_KEY` | Google Gemini API key | Yes |

### **Customization Options**

```python
# Adjust search parameters
reddit_search_api(
    keyword="query",
    date="Last year",        # Time filter
    sort_by="Hot",          # Sorting method
    num_of_posts=50         # Number of posts
)

# Configure comment extraction
reddit_post_retrieval(
    urls=selected_urls,
    days_back=30,           # Comment age limit
    load_all_replies=True,  # Include reply chains
    comment_limit="100"     # Max comments per post
)
```

## 🧪 Development & Testing

### **API Testing**
```bash
# Test individual components
uv run python -c "
from web_operations import serp_search
result = serp_search('test query', engine='google')
print(f'Found {len(result.get(\"organic\", []))} results')
"
```

### **Debug Mode**
Enable verbose logging by setting environment variable:
```bash
export PYTHONPATH=/path/to/project
uv run python main.py  # Includes detailed progress output
```

## 🚀 Deployment

### **Production Considerations**
- **Error Handling**: Comprehensive exception management and retry logic
- **Monitoring**: Progress tracking and performance metrics
- **Security**: API key management and request validation
- **Scalability**: Horizontal scaling for concurrent user requests

### **Docker Support**
```dockerfile
FROM python:3.14-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["python", "main.py"]
```

## 🔒 Security & Privacy

- **API Key Protection**: Environment-based configuration
- **Data Privacy**: No persistent storage of user queries
- **Rate Limiting**: Built-in protection against API abuse
- **Input Validation**: Sanitization of user-provided content

## 🤝 Contributing

### **Development Guidelines**
1. Follow PEP 8 style conventions
2. Add comprehensive docstrings to new functions
3. Include error handling for all API calls
4. Update README for new features
5. Test with multiple query types

### **Code Structure**
- **Modular Design**: Separate concerns into focused modules
- **Type Hints**: Full type annotation coverage
- **Error Handling**: Graceful degradation on failures
- **Configuration**: Environment-based settings

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Bright Data**: Professional web scraping infrastructure
- **Google**: Gemini AI integration for advanced reasoning
- **LangChain**: Framework for LLM application development
- **LangGraph**: Workflow orchestration and state management
- **Reddit**: Community-driven insights and discussions

## 📞 Support

For questions, issues, or contributions:
- Create an issue in the project repository
- Review the API documentation for each integration
- Check the configuration examples in this README

---

## 🙏 Acknowledgments

**Built with ❤️ using Python, LangChain, and modern AI technologies**