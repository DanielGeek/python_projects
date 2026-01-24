# 29-CrewAI-Stock-Picker: Intelligent Investment Analysis System

A sophisticated multi-agent AI system powered by CrewAI that performs comprehensive financial analysis, identifies trending companies, and makes data-driven investment recommendations with real-time market intelligence and persistent learning capabilities.

## 🎯 Overview

This project creates an intelligent stock analysis and recommendation system with four specialized AI agents working under hierarchical management:

- **Manager**: Orchestrates the entire investment analysis workflow
- **Financial News Analyst**: Identifies trending companies using real-time news search
- **Senior Financial Researcher**: Conducts deep financial analysis and market research
- **Stock Picker**: Makes final investment decisions based on comprehensive analysis

The system leverages advanced memory systems, real-time web searches, and push notifications to deliver actionable investment insights.

## 🚀 Key Features

### Multi-Agent Architecture

- **Hierarchical Process**: Manager delegates tasks and coordinates workflow
- **Specialized Agents**: Each agent has specific expertise and tools
- **Real-Time Coordination**: Dynamic task assignment and quality control
- **Collaborative Intelligence**: Agents share context and findings

### Advanced Memory Systems

- **Short-Term Memory**: Recent conversations and current session context
- **Long-Term Memory**: Persistent knowledge and historical insights
- **Entity Memory**: Extracted companies, relationships, and semantic connections
- **ChromaDB Vector Storage**: Embeddings for semantic search and retrieval

### Real-Time Market Intelligence

- **SerperDevTool Integration**: Live web searches for current market data
- **News Analysis**: Trending company identification from latest news
- **Financial Research**: Deep dive into company fundamentals and outlook
- **Market Context**: Current year analysis with specific date references

### Smart Notifications

- **Push Notifications**: Instant investment recommendations via Pushover
- **Decision Alerts**: Real-time notifications when investment decisions are made
- **Custom Branding**: 📈 AI Stock Picker notifications with professional title

### Professional Output Generation

- **JSON Reports**: Structured data for trending companies and research analysis
- **Markdown Decisions**: Detailed investment rationale and comparative analysis
- **Source Citations**: All data includes sources and publication dates
- **Error Handling**: Robust JSON validation and formatting

## 🚀 Quick Start

### Prerequisites

- Python >=3.10 and <3.14
- OpenAI API key
- Serper API key (for web searches)
- Pushover API keys (for notifications)
- UV package manager

### Installation & Setup

#### 1. Install UV (if not already installed)

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

#### 2. Install CrewAI CLI

```bash
uv tool install crewai --python 3.12
```

#### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys
# OPENAI_API_KEY=sk-proj-your-key-here
# SERPER_API_KEY=your-serper-api-key-here
# PUSHOVER_USER=your-pushover-user-here
# PUSHOVER_TOKEN=your-pushover-token-here
```

#### 4. Install Project Dependencies

```bash
crewai install
```

#### 5. Run Investment Analysis

```bash
crewai run
```

## 🛠️ CrewAI CLI Commands

### Essential Commands

```bash
# Create new CrewAI project
crewai create crew <project-name>

# Install dependencies for existing project
crewai install

# Run the crew
crewai run

# Run with verbose output
crewai run --verbose

# Enable tracing for debugging
crewai traces enable

# Disable tracing
crewai traces disable

# Update CrewAI CLI
uv tool install crewai --upgrade
```

### Project Structure

```text
29-crewai-stock_picker/
├── .gitignore
├── knowledge/                    # Knowledge base files
├── memory/                       # Memory storage systems
│   ├── chroma.sqlite3           # Vector embeddings storage
│   ├── long_term_memory_storage.db # Persistent knowledge
│   └── fe9b586c-868f-4733-bcca-2236942f3016/ # ChromaDB data
├── pyproject.toml               # Project dependencies
├── README.md
├── .env                         # Environment variables
├── output/                      # Generated analysis files
│   ├── trending_companies.json  # Trending companies list
│   ├── research_report.json     # Detailed company analysis
│   └── decision.md              # Final investment decision
└── src/
    └── stock_picker/
        ├── __init__.py
        ├── main.py             # Entry point with sector/year inputs
        ├── crew.py             # Crew orchestration with memory systems
        ├── tools/
        │   ├── __init__.py
        │   └── push_tool.py    # Push notification tool
        └── config/
            ├── agents.yaml     # Agent definitions
            └── tasks.yaml      # Task definitions with JSON validation
```

## 🧠 Memory System Architecture

### Memory Components

#### Short-Term Memory
- **Storage**: ChromaDB with OpenAI embeddings
- **Content**: Recent conversations, current session context
- **Purpose**: Maintains conversation flow and immediate context

#### Long-Term Memory
- **Storage**: SQLite database with structured queries
- **Content**: Historical insights, market patterns, learned knowledge
- **Purpose**: Persistent learning across sessions

#### Entity Memory
- **Storage**: ChromaDB vector embeddings
- **Content**: Companies, relationships, market entities
- **Purpose**: Semantic connections and entity relationships

### Memory Benefits

```python
# Example: Learning from previous analyses
Session 1: Analyzes Tesla → Stores EV market insights
Session 2: Analyzes Rivian → Recalls Tesla patterns for comparison
Session 3: Analyzes Lucid → Compares with all previous EV analysis
```

## 📊 Investment Analysis Workflow

### 1. Trending Company Discovery
- **Real-time News Search**: Latest market news and trends
- **Sector-Specific Analysis**: Focus on Technology sector (configurable)
- **Current Year Context**: 2026 market dynamics and developments
- **JSON Validation**: Ensures clean, structured output

### 2. Deep Financial Research
- **Company-Specific Analysis**: Market position, financial health
- **Future Outlook**: Growth prospects and market opportunities
- **Investment Potential**: Risk assessment and return projections
- **Source Verification**: All data cited with publication dates

### 3. Investment Decision Making
- **Comparative Analysis**: Evaluate all researched companies
- **Risk-Adjusted Selection**: Best risk/reward balance
- **Push Notification**: Instant decision delivery
- **Detailed Rationale**: Comprehensive explanation of choice

## 📈 Example Usage & Output

### Running Analysis
```bash
cd 29-crewai-stock_picker
crewai run
```

### Expected Output
```bash
🤖 Agent Started: Manager
Manager is delegating task to: Financial News Analyst
🔧 Tool Execution: Searching trending technology companies 2026
✅ Agent Final Answer: Found 3 trending companies
🤖 Agent Started: Senior Financial Researcher
🔧 Tool Execution: Researching Perplexity AI company profile 2026
📱 Push Notification: 📈 AI Stock Picker - Investment recommendation sent
✅ Final Decision: Perplexity AI selected for investment
```

### Generated Files

#### `output/trending_companies.json`
```json
{
    "companies": [
        {
            "name": "Perplexity AI",
            "ticker": "PAXI",
            "reason": "Innovative company in the AI space, reshaping business models."
        }
    ]
}
```

#### `output/decision.md`
```markdown
# Investment Decision: Perplexity AI

## Selected Company: Perplexity AI
**Investment Rationale**: Strong growth trajectory, $18B valuation, expanding user base...

## Companies Not Selected:
- **Liquid Death**: Strong brand but limited tech sector exposure
- **Cellebrite DI**: Niche market with limited growth potential
```

## 🔧 Customization

### Change Analysis Parameters
Edit `src/stock_picker/main.py`:
```python
inputs = {
    'sector': 'Healthcare',      # Change sector
    'current_year': 2026         # Change analysis year
}
```

### Add Custom Search Queries
Edit `src/stock_picker/config/tasks.yaml`:
```yaml
description: >
  Find trending companies in {sector} of {current_year}
  Add custom search parameters for specific analysis needs
```

### Configure Memory Retention
Edit `src/stock_picker/crew.py`:
```python
long_term_memory = LongTermMemory(
    storage = LTMSQLiteStorage(
        db_path="./memory/long_term_memory_storage.db",
        retention_days=365  # Customize retention period
    )
)
```

## 🔧 Troubleshooting

### Common Issues

**JSON Validation Errors**:
- Enhanced JSON format requirements in task definitions
- Explicit trailing comma prevention
- Valid JSON structure enforcement

**Memory System Issues**:
- Check `./memory/` directory permissions
- Verify ChromaDB and SQLite file integrity
- Monitor memory usage and storage capacity

**API Integration Problems**:
- Verify all API keys in `.env` file
- Check Serper API quota and billing
- Test Pushover notification configuration

**CrewAI Process Issues**:
- Ensure `Process.hierarchical` for manager functionality
- Verify agent delegation permissions
- Check task dependencies and context flow

## 🎨 Features

### Core Capabilities
- **Multi-Agent Intelligence**: Specialized agents with hierarchical coordination
- **Real-Time Market Data**: Live web searches and current market intelligence
- **Persistent Learning**: Advanced memory systems for continuous improvement
- **Professional Analysis**: Structured reports with source citations
- **Instant Notifications**: Real-time investment recommendations

### Advanced Features
- **Customizable Sectors**: Analyze any market sector
- **Year-Specific Analysis**: Current year or historical periods
- **Memory Persistence**: Learning across multiple sessions
- **Entity Recognition**: Automatic extraction of companies and relationships
- **Investment Tracking**: Historical decision analysis and performance

## 🚀 Production Features

- **Error Handling**: Robust JSON validation and error recovery
- **Data Validation**: Source verification and citation requirements
- **Memory Management**: Efficient storage and retrieval systems
- **Scalable Architecture**: Modular agent and task configuration
- **Professional Output**: Investment-grade analysis and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your improvements
4. Submit a pull request

## 📚 Resources

- [CrewAI Documentation](https://docs.crewai.com)
- [CrewAI GitHub](https://github.com/joaomdmoura/crewai)
- [CrewAI Discord](https://discord.com/invite/X4JWnZnxPb)
- [Serper API Documentation](https://serper.dev/)
- [Pushover API Documentation](https://pushover.net/api)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ using [CrewAI](https://crewai.com) - Creating intelligent investment analysis systems with persistent learning and real-time market intelligence.
