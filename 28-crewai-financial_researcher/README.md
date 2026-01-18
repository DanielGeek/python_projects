# 28-CrewAI-Financial-Researcher: Real-Time Financial Analysis System

A sophisticated financial research and analysis system powered by CrewAI that provides up-to-date company analysis using real-time web searches. This system leverages multi-agent AI architecture to deliver comprehensive financial reports with current market data, recent news, and forward-looking insights.

## Overview

This project creates an intelligent financial research system with two specialized AI agents:

- **Senior Financial Researcher**: Conducts real-time web searches for current financial data
- **Market Analyst**: Creates comprehensive reports with analysis and insights

The system uses **SerperDevTool** for real-time web searches, ensuring access to the most current financial information, stock prices, earnings reports, and market analysis.

## Key Features

### Real-Time Data Integration

- **Live Stock Prices**: Current market data with specific dates
- **Recent News**: Latest announcements and developments
- **Earnings Reports**: Quarterly/annual financial results
- **Market Analysis**: Current analyst opinions and projections

### Multi-Agent Architecture

- **Research Agent**: Web search specialist with SerperDevTool
- **Analysis Agent**: Report generation and financial analysis
- **Sequential Processing**: Research → Analysis workflow

### Professional Reporting

- **Structured Format**: Executive summary, current status, developments, analysis, outlook
- **Source Citations**: All data includes sources and publication dates
- **Date-Specific**: Every data point includes temporal context

## Quick Start

### Prerequisites

- Python >=3.10 and <3.14
- OpenAI API key
- Serper API key (for web searches)
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
```

#### 4. Install Project Dependencies
```bash
crewai install
```

#### 5. Run Financial Analysis
```bash
crewai run
```

## CrewAI CLI Commands

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

```
28-crewai-financial_researcher/
├── .gitignore
├── knowledge/                    # Knowledge base files
├── pyproject.toml               # Project dependencies
├── README.md
├── .env                         # Environment variables
├── output/
│   └── report.md               # Generated financial reports
└── src/
    └── financial_researcher/
        ├── __init__.py
        ├── main.py             # Entry point with company/year inputs
        ├── crew.py             # Crew orchestration
        ├── tools/
        │   └── __init__.py
        └── config/
            ├── agents.yaml     # Agent definitions
            └── tasks.yaml      # Task definitions with search requirements
```

## How It Works

### Research Process

1. **Real-Time Searches**: Research agent performs 5 mandatory web searches:
   - `"{company} stock price {year}"`
   - `"{company} earnings report {year}"`
   - `"{company} news {year}"`
   - `"{company} financial results {year}"`
   - `"{company} market analysis {year}"`

2. **Data Collection**: Gathers current financial data, stock prices, recent news

3. **Analysis Creation**: Analyst agent creates comprehensive report with insights

### Report Structure

1. **Executive Summary**: Key findings from current year data
2. **Current Status**: Latest stock price, financial results, market position
3. **Recent Developments**: News, product launches, strategic changes
4. **Analysis and Trends**: Market dynamics, sales patterns, growth opportunities
5. **Future Outlook**: Projections, challenges, strategic focus

### Customization

#### Change Company or Year

Edit `src/financial_researcher/main.py`:

```python
inputs = {
    'company': 'Apple',      # Change company
    'year': datetime.now().year  # Current year or specific year
}
```

#### Add More Search Queries
Edit `src/financial_researcher/config/tasks.yaml`:
```yaml
REQUIRED SEARCHES:
  6. "{company} competitor analysis {year}"
  7. "{company} market share {year}"
```

## Example Output

The system generates comprehensive financial reports:
- **Current Data**: Real-time stock prices and market metrics
- **Recent News**: Latest announcements and developments
- **Financial Analysis**: Professional insights and trend analysis
- **Source Citations**: All data includes sources and dates
- **Future Projections**: Analyst expectations and market outlook

### Sample Report Excerpt:

```markdown
# Tesla Company Analysis Report - 2026

## Current Status (as of 2026)
- **Stock Price**: As of January 16, 2026, Tesla's stock (TSLA) is trading at approximately **$437.86**.
- **Recent Financial Results**: As of January 2026, Tesla reported a decline in vehicle deliveries for 2025, selling **589,000** vehicles.
```

## Troubleshooting

### Common Issues

**API Key Issues**:
- Verify `OPENAI_API_KEY` and `SERPER_API_KEY` in `.env`
- Check Serper API quota and billing

**Outdated Data**:

- Ensure SerperDevTool is properly configured
- Check that web searches are being performed (look for search logs)
- Verify internet connectivity

**CrewAI Installation Issues**:

```bash
# Clear cache and reinstall
uv cache clean
uv tool install crewai --upgrade --python 3.12
```

## Features

### Core Capabilities
- **Real-Time Data**: Live financial information via web searches
- **Multi-Agent Architecture**: Specialized research and analysis agents
- **Professional Reporting**: Structured financial analysis format
- **Source Verification**: All data includes citations and dates
- **Flexible Configuration**: Easy to modify companies and search parameters

### Advanced Features

- **Customizable Companies**: Analyze any publicly traded company
- **Year-Specific Analysis**: Focus on current year or historical periods
- **Extensible Search**: Add custom search queries for specific data
- **Professional Formatting**: Markdown reports with proper structure
- **Date-Specific Context**: Every data point includes temporal information

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your improvements
4. Submit a pull request

## Resources

- [CrewAI Documentation](https://docs.crewai.com)
- [CrewAI GitHub](https://github.com/joaomdmoura/crewai)
- [CrewAI Discord](https://discord.com/invite/X4JWnZnxPb)
- [Serper API Documentation](https://serper.dev/)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ using [CrewAI](https://crewai.com) - Creating intelligent financial analysis systems.
