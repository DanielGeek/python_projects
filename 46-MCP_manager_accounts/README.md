# MCP Manager Accounts

A comprehensive Model Context Protocol (MCP) server implementation for managing investment accounts with AI agents.

## 🏗️ Architecture

This project implements a multi-server MCP architecture for automated trading and account management:

```text
46-MCP_manager_accounts/
├── src/
│   ├── __init__.py
│   ├── accounts.py           # Account management system
│   ├── accounts_server.py    # MCP server for account operations
│   ├── database.py           # SQLite database operations
│   ├── market.py             # Market data and utilities
│   ├── mcp_params.py         # MCP server configuration
│   ├── traders.py            # AI trading agent implementation
│   ├── trading_floor.py      # Multi-agent orchestration system
│   ├── tracers.py            # Logging and tracing utilities
│   └── util.py               # CSS/JS utilities and styling
├── example1.py              # Basic account operations
├── example2.py              # Account with MCP server
├── example3.py              # Account + market data
├── example4.py              # Account + market + notifications
├── example5.py              # Basic AI trading agent
├── example6.py              # Advanced error handling
├── example7.py              # Financial researcher agent
├── example8.py              # Autonomous trader agent
├── example9.py              # Advanced trader with streaming
├── app.py                   # Web dashboard for monitoring
├── .env.example             # Environment variables template
├── db/                      # SQLite database directory
└── README.md                # This file
└── pyproject.toml                # Project dependencies
```

## 🚀 Features

### Core Functionality

-
- **Account Management**: Create, read, update investment accounts
- **Trading Operations**: Buy/sell shares with rationale tracking
- **Market Data Integration**: Real-time and historical market data
- **AI Agent Integration**: OpenAI agents for automated trading
- **Notification System**: Push notifications for trade alerts
- **Transaction Logging**: Complete audit trail with timestamps
- **Memory Persistence**: Long-term memory storage with MCP and libsql
- **Web Search Integration**: Real-time web search with Brave Search API
- **Market Data Integration**: Real-time and historical stock market data with Polygon.io
- **Advanced Error Handling**: Comprehensive error reporting and troubleshooting

### MCP Servers

1. **Accounts Server** (`src/accounts_server.py`)

   - `get_balance(name)` - Get account cash balance
   - `get_holdings(name)` - Get current stock holdings
   - `buy_shares(name, symbol, quantity, rationale)` - Buy shares
   - `sell_shares(name, symbol, quantity, rationale)` - Sell shares
   - `change_strategy(name, strategy)` - Update investment strategy
   - Resources: `accounts://accounts_server/{name}`, `accounts://strategy/{name}`

2. **Market Server** (`src/market_server.py`)

   - `lookup_share_price(symbol)` - Get current stock price

3. **Push Server** (`src/push_server.py`)

   - `push(message)` - Send push notifications

4. **Memory Server** (External - `mcp-memory-libsql`)

   - `create_entities(entities)` - Create entities with observations
   - `search_nodes(query, limit)` - Search entities with relevance ranking
   - `read_graph()` - Get recent entities and relations
   - `create_relations(relations)` - Create relations between entities
   - `delete_entity(name)` - Delete entity and associated data
   - `delete_relation(source, target, type)` - Delete specific relation

5. **Brave Search Server** (External - `@modelcontextprotocol/server-brave-search`)

   - `brave_search(query)` - Search the web using Brave Search API
   - Real-time web search with news, finance, and general information

6. **Market Server** (`src/market_server.py`)

   - `lookup_share_price(symbol)` - Get current stock price for any symbol
   - Real-time market data with Polygon.io integration
   - Intelligent caching to avoid API rate limiting
   - Fallback to simulated data when API is unavailable

7. **Polygon MCP Server** (External - `mcp_polygon`)

   - `get_snapshot_ticker(symbol)` - Get real-time stock price snapshots
   - Advanced error handling with detailed API error reporting
   - Professional-grade market data integration

## 📦 Dependencies

```toml
[project]
dependencies = [
    "ipython>=9.10.0",
    "openai>=1.0.0",
    "openai-agents>=0.10.1",
    "polygon-api-client>=1.16.3",
    "python-dotenv>=1.2.1",
]
```


## 🛠️ Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   uv sync
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

## 🔧 Configuration

Required environment variables:

```bash
# OpenAI API (required for AI agents)
OPENAI_API_KEY=your_openai_api_key

# Brave Search API (for web search - https://api-dashboard.search.brave.com/app/keys)
BRAVE_API_KEY=your_brave_api_key

# Polygon API (for market data)
POLYGON_API_KEY=your_polygon_api_key
POLYGON_PLAN=free|paid|realtime

# Pushover (for notifications - optional)
PUSHOVER_USER=your_pushover_user_key
PUSHOVER_TOKEN=your_pushover_api_token
```


## 📖 Usage Examples

### Example 1: Basic MCP Server Usage

```python
# example1.py - Direct MCP server interaction
from src.accounts import Account
from agents.mcp import MCPServerStdio

# Create account and perform trades
account = Account.get("Ed")
account.buy_shares("AMZN", 3, "Because this bookstore website looks promising")

# Connect to MCP server
params = {"command": "uv", "args": ["run", "src/accounts_server.py"]}
async with MCPServerStdio(params=params) as server:
    # Use MCP tools through AI agent
    agent = Agent(name="account_manager", instructions=instructions, mcp_servers=[server])
    result = await Runner.run(agent, "What's my balance and holdings?")
```

### Example 2: Advanced AI Agent Integration

```python
# example2.py - Full AI agent with MCP tools
from src.accounts_client import get_accounts_tools_openai
from src.accounts import Account

# Get MCP tools as OpenAI function tools
openai_tools = await get_accounts_tools_openai()

# Create AI agent with account management capabilities
agent = Agent(
    name="account_manager", 
    instructions="You are able to manage an account for a client",
    model="gpt-4.1-mini",
    tools=openai_tools
)

# Query account information
result = await Runner.run(agent, "My name is Ed. What's my balance?")

# Access account data directly
context = await read_accounts_resource("ed")
report = Account.get("ed").report()
```

### Example 3: MCP Memory Persistence

```python
# example3.py - Persistent memory with MCP and libsql
from agents import Agent, Runner, trace
from agents.mcp import MCPServerStdio

# Configure memory server with libsql database
params = {
    "command": "npx",
    "args": ["-y", "mcp-memory-libsql"],
    "env": {"LIBSQL_URL": "file:./memory/daniel.db"}
}

instructions = "You use your entity tools as persistent memory to store and recall information."

async def main():
    # Session 1: Store information about Daniel
    async with MCPServerStdio(params=params) as memory_server:
        agent = Agent(name="agent", instructions=instructions, model="gpt-4.1-mini", mcp_servers=[memory_server])
        with trace("conversation"):
            result = await Runner.run(agent, "My name's Daniel. I'm an LLM engineer teaching AI Agents.")
            print(result.final_output)
    
    # Session 2: Recall information about Daniel
    async with MCPServerStdio(params=params) as memory_server:
        agent = Agent(name="agent", instructions=instructions, model="gpt-4.1-mini", mcp_servers=[memory_server])
        with trace("conversation"):
            result = await Runner.run(agent, "Search your memory for information about Daniel.")
            print(result.final_output)
```

**Memory Features:**

- **Entity Creation**: Store people, concepts, and relationships
- **Semantic Search**: Find entities with relevance ranking
- **Persistent Storage**: Data survives across agent sessions
- **Graph Relations**: Create and manage entity relationships
- **Cross-Session Memory**: Information persists between different agent instances

```

### Example 4: Web Search Integration

```python
# example4.py - Real-time web search with Brave Search API
from agents import Agent, Runner, trace
from agents.mcp import MCPServerStdio
from datetime import datetime
import os

# Configure Brave Search server
env = {"BRAVE_API_KEY": os.getenv("BRAVE_API_KEY")}
params = {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-brave-search"],
    "env": env,
}

instructions = "You are able to search the web for information and briefly summarize the takeaways."

async def main():
    async with MCPServerStdio(params=params) as search_server:
        agent = Agent(
            name="research_agent", 
            instructions=instructions, 
            model="gpt-4o-mini", 
            mcp_servers=[search_server]
        )
        
        # Research latest stock news with current date context
        request = f"Please research the latest news on Amazon stock price and briefly summarize its outlook. For context, the current date is {datetime.now().strftime('%Y-%m-%d')}"
        
        with trace("web_search"):
            result = await Runner.run(agent, request)
            print(result.final_output)
```

**Web Search Features:**

- **Real-time Search**: Access to current web information via Brave Search API
- **News Integration**: Latest financial news and market analysis
- **Context-aware**: Automatically includes current date in search queries
- **Summarization**: AI-powered summarization of search results
- **Finance Focus**: Optimized for stock market and financial research

**Use Cases:**
- Stock market research and analysis
- Latest financial news aggregation
- Company-specific information gathering
- Market sentiment analysis
- Investment decision support

**Error Handling:**
- Pre-execution API key validation to catch missing credentials early
- Structured error reporting with detailed technical information
- Extracts complete error details: code, message, component, status, and type
- Prevents generic responses - forces transparent error disclosure
- Consistent format with ⚠️ emoji prefix for easy identification
- Provides specific troubleshooting steps for each error type

**Error Response Format:**
```
⚠️ API ERROR DETECTED:
Error: Brave API error: 422 
Error Code: 422
Error Detail: The provided subscription token is invalid.
Error Component: authentication
Error Status: 422
Error Type: ErrorResponse
```

### Example 5: Market Data Integration

```python
# example5.py - Real-time market data with Polygon.io API
from polygon import RESTClient
from src.market import get_share_price
from agents import Agent, Runner, trace
from agents.mcp import MCPServerStdio

# Validate API key before proceeding
polygon_api_key = os.getenv("POLYGON_API_KEY")
if not polygon_api_key or polygon_api_key == "your_polygon_api_key":
    print("❌ ERROR: POLYGON_API_KEY is not configured!")
    exit(1)

client = RESTClient(polygon_api_key)

# Get previous close data directly from Polygon
previous_close = client.get_previous_close_agg("AAPL")[0]
print("Previous close:", previous_close)

# Use cached market data function
print("get_share_price:", get_share_price("AAPL"))

# Test caching with multiple calls
for i in range(1000):
    get_share_price("AAPL")  # Only 1 API call due to caching

async def main():
    params = {"command": "uv", "args": ["run", "src/market_server.py"]}
    
    async with MCPServerStdio(params=params) as market_server:
        agent = Agent(
            name="market_agent", 
            instructions="You answer questions about the stock market.", 
            model="gpt-4.1-mini", 
            mcp_servers=[market_server]
        )
        
        with trace("market_query"):
            result = await Runner.run(agent, "What's the share price of Apple?")
            print(result.final_output)
```

**Market Data Features:**

- **Real-time Data**: Access to current stock prices via Polygon.io API
- **Historical Data**: Previous close prices with full OHLCV data
- **Intelligent Caching**: LRU cache prevents API rate limiting
- **Fallback System**: Uses simulated data when API is unavailable
- **Bulk Data**: Grouped daily aggregates for market-wide data
- **Plan Support**: Adapts to free, paid, and realtime Polygon plans

**Data Sources:**

- **Primary**: Polygon.io API (real-time and historical)
- **Secondary**: Local SQLite database cache
- **Fallback**: Random number generation for testing

**Performance Optimizations:**

- **@lru_cache**: Reduces API calls from 1000+ to 1
- **Database Persistence**: Survives application restarts
- **Rate Limiting Protection**: Prevents 429 errors
- **Plan-aware Logic**: Uses appropriate endpoints based on subscription

**Use Cases:**

- Real-time stock price queries
- Portfolio valuation
- Market research and analysis
- Trading algorithm development
- Financial dashboard integration

### Example 6: Advanced Error Handling with Polygon MCP Server

```python
# example6.py - Professional error handling with external MCP server
from dotenv import load_dotenv
from agents import Agent, Runner, trace
from agents.mcp import MCPServerStdio
import os

# Validate API key before proceeding
polygon_api_key = os.getenv("POLYGON_API_KEY")
if not polygon_api_key or polygon_api_key == "your_polygon_api_key":
    print("\n❌ ERROR: POLYGON_API_KEY is not configured!")
    print("📝 To fix this:")
    print("   1. Get your API key from: https://polygon.io/pricing")
    print("   2. Add it to your .env file: POLYGON_API_KEY=your_actual_key")
    print("   3. Note: Free plans have limitations on real-time data access")
    print("   4. Run the example again\n")
    exit(1)

# Configure external Polygon MCP server
params = {
    "command": "uvx",
    "args": [
        "--from",
        "git+https://github.com/polygon-io/mcp_polygon@v0.1.0",
        "mcp_polygon",
    ],
    "env": {"POLYGON_API_KEY": polygon_api_key},
}

# Enhanced instructions with strict error reporting
instructions = """You answer questions about the stock market.

CRITICAL ERROR REPORTING RULES:
When you encounter ANY error from the get_snapshot_ticker tool, you MUST:
1. Start your response with "⚠️ API ERROR DETECTED:"
2. Quote the EXACT error message you received (including error codes like 422, 401, etc.)
3. Explain what this error means in plain terms
4. Provide specific steps to fix it

DO NOT provide generic responses like "I'm unable to access information" without explaining the technical error."""

request = "What's the share price of Apple? Use your get_snapshot_ticker tool to get the latest price."
model = "gpt-4.1-mini"

async def main():
    async with MCPServerStdio(params=params, client_session_timeout_seconds=60) as server:
        mcp_tools = await server.list_tools()
        print("Available tools:", mcp_tools)

    async with MCPServerStdio(params=params, client_session_timeout_seconds=60) as mcp_server:
        agent = Agent(
            name="market_agent", 
            instructions=instructions, 
            model=model, 
            mcp_servers=[mcp_server]
        )
        
        with trace("market_query"):
            result = await Runner.run(agent, request)
            print(result.final_output)
```

**Advanced Error Handling Features:**

- **Pre-execution Validation**: Comprehensive API key validation with helpful setup instructions
- **External MCP Server**: Uses official Polygon MCP server for professional-grade integration
- **Structured Error Reporting**: Enforces detailed error disclosure with specific technical details
- **Tool Discovery**: Lists available MCP tools before execution
- **Enhanced Instructions**: Strict error reporting rules prevent generic responses
- **Professional Integration**: Demonstrates production-ready MCP server usage

**Error Handling Excellence:**

1. **Validation Layer**: Catches missing API keys before execution
2. **Transparent Reporting**: Forces agents to reveal exact error details
3. **User Guidance**: Provides specific troubleshooting steps
4. **Technical Details**: Captures error codes, messages, and request IDs
5. **Consistent Format**: Standardized error response structure

**External MCP Server Benefits:**

- **Official Support**: Uses Polygon's maintained MCP server
- **Advanced Features**: Access to professional market data tools
- **Better Performance**: Optimized data retrieval and caching
- **Regular Updates**: Maintained by Polygon.io team
- **Production Ready**: Designed for enterprise use

**Use Cases:**

- Production market data integration
- Professional trading applications
- Financial dashboard development
- Risk management systems
- Portfolio analysis tools
- Real-time market monitoring

### Example 7: Financial Researcher Agent with Web Search

```python
# example7.py - Financial researcher agent with multi-server integration
from dotenv import load_dotenv
from agents import Agent, Runner, trace
from agents.mcp import MCPServerStdio
from datetime import datetime
import os

# Configure multiple MCP servers
researcher_mcp_server_params = [
    {"command": "uvx", "args": ["mcp-server-fetch"]},
    {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-brave-search"],
        "env": {"BRAVE_API_KEY": os.getenv("BRAVE_API_KEY")},
    },
]

# Create researcher agent with error handling
async def get_researcher(mcp_servers) -> Agent:
    instructions = f"""You are a financial researcher. You are able to search the web for interesting financial news,
look for possible trading opportunities, and help with research.
Based on the request, you carry out necessary research and respond with your findings.
Take time to make multiple searches to get a comprehensive overview, and then summarize your findings.
If there isn't a specific request, then just respond with investment opportunities based on searching latest news.
The current datetime is {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

CRITICAL ERROR REPORTING RULES:
When you encounter ANY error from web search tools, you MUST:
1. Start your response with "⚠️ API ERROR DETECTED:"
2. Quote the EXACT error message you received
3. Explain what this error means in plain terms
4. Provide specific steps to fix it"""
    
    return Agent(
        name="Researcher",
        instructions=instructions,
        model="gpt-4.1-mini",
        mcp_servers=mcp_servers,
    )

async def main():
    # Connect MCP servers
    researcher_mcp_servers = [
        MCPServerStdio(params, client_session_timeout_seconds=30)
        for params in researcher_mcp_server_params
    ]
    
    for server in researcher_mcp_servers:
        await server.connect()
    
    researcher = await get_researcher(researcher_mcp_servers)
    research_question = "What's the latest news on Amazon?"
    
    with trace("Researcher"):
        result = await Runner.run(researcher, research_question, max_turns=30)
    print(result.final_output)
```

**Financial Researcher Features:**

- **Multi-Server Integration**: Combines web fetch and Brave Search capabilities
- **Comprehensive Research**: Multiple searches for complete market overview
- **Error Handling**: Transparent reporting of API errors and issues
- **Current Context**: Automatically includes current date in research
- **Financial Focus**: Optimized for stock market and investment research

**Use Cases:**
- Stock market research and analysis
- Latest financial news aggregation
- Company-specific information gathering
- Investment opportunity identification
- Market sentiment analysis

### Example 8: Autonomous Trader Agent with Research Integration

```python
# example8.py - Autonomous trader with research tool integration
from dotenv import load_dotenv
from agents import Agent, Runner, trace, Tool
from agents.mcp import MCPServerStdio
from src.accounts_client import read_accounts_resource, read_strategy_resource
from src.accounts import Account
import os

# Configure all MCP servers
trader_mcp_server_params = [
    {"command": "uv", "args": ["run", "src/accounts_server.py"]},
    {"command": "uv", "args": ["run", "src/push_server.py"]},
    market_mcp,  # Polygon or local market server
]

researcher_mcp_server_params = [
    {"command": "uvx", "args": ["mcp-server-fetch"]},
    {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-brave-search"],
        "env": {"BRAVE_API_KEY": os.getenv("BRAVE_API_KEY")},
    },
]

# Create researcher as a tool for the trader
async def get_researcher_tool(mcp_servers) -> Tool:
    researcher = await get_researcher(mcp_servers)
    return researcher.as_tool(
        tool_name="Researcher",
        tool_description="This tool researches online for news and opportunities, \
            either based on your specific request to look into a certain stock, \
            or generally for notable financial news and opportunities. \
            Describe what kind of research you're looking for."
    )

async def main():
    agent_name = "Daniel"
    
    # Get current account state
    account_details = await read_accounts_resource(agent_name)
    strategy = await read_strategy_resource(agent_name)
    
    # Create trader instructions with context
    instructions = f"""
    You are a trader that manages a portfolio of shares. Your name is {agent_name} and your account is under your name, {agent_name}.
    You have access to tools that allow you to search the internet for company news, check stock prices, and buy and sell shares.
    Your investment strategy for your portfolio is:
    {strategy}
    Your current holdings and balance is:
    {account_details}
    You have the tools to perform a websearch for relevant news and information.
    You have tools to check stock prices.
    You have tools to buy and sell shares.
    You have tools to save memory of companies, research and thinking so far.
    Please make use of these tools to manage your portfolio. Carry out trades as you see fit; do not wait for instructions or ask for confirmation.
    """
    
    # Connect all MCP servers
    mcp_servers = trader_mcp_servers + researcher_mcp_servers
    for server in mcp_servers:
        await server.connect()
    
    # Create researcher tool
    researcher_tool = await get_researcher_tool(researcher_mcp_servers)
    
    # Create autonomous trader
    trader = Agent(
        name=agent_name,
        instructions=instructions,
        tools=[researcher_tool],
        mcp_servers=trader_mcp_servers,
        model="gpt-4o-mini",
    )
    
    prompt = """
    Use your tools to make decisions about your portfolio.
    Investigate the news and the market, make your decision, make the trades, and respond with a summary of your actions.
    """
    
    with trace(agent_name):
        result = await Runner.run(trader, prompt, max_turns=30)
    
    # Display results and final portfolio state
    print("Trading Summary:", result.final_output)
    print("Final Portfolio:", await read_accounts_resource(agent_name))
```

**Autonomous Trader Features:**

- **Research Integration**: Uses researcher tool for market analysis
- **Portfolio Management**: Complete trading autonomy with strategy awareness
- **Multi-Tool Architecture**: Combines research, trading, and account management
- **Real-time Decisions**: Investigates market conditions and executes trades
- **Context-Aware Trading**: Considers current holdings, balance, and strategy
- **Comprehensive Reporting**: Detailed trade summaries and portfolio updates

**Trader Capabilities:**
- Autonomous market research and analysis
- Real-time trade execution based on research findings
- Portfolio rebalancing and optimization
- Risk assessment and management
- Strategy-aligned decision making
- Complete audit trail with rationale

**Use Cases:**
- Automated trading systems
- Portfolio management automation
- Market research-driven trading
- Strategy implementation and testing
- Risk-managed investment execution

### Example 9: Advanced Trader with Streaming Real-Time Output

```python
# example9.py - Professional trader with real-time streaming and MCP server analytics
from dotenv import load_dotenv
from src.accounts_client import read_accounts_resource
from src.traders import Trader
from src.mcp_params import trader_mcp_server_params, researcher_mcp_server_params
from agents.mcp import MCPServerStdio

load_dotenv(override=True)

# Initialize advanced trader with streaming capabilities
trader = Trader("Daniel")

# Get all MCP server parameters for analytics
all_params = trader_mcp_server_params + researcher_mcp_server_params("Daniel")

async def main():
    # Run trader with real-time streaming output
    await trader.run()
    
    # Display final account state
    read_accounts_resource_result = await read_accounts_resource("Daniel")
    print("read_accounts_resource_result", read_accounts_resource_result)

    # MCP server analytics - count available tools
    count = 0
    for each_params in all_params:
        async with MCPServerStdio(params=each_params, client_session_timeout_seconds=60) as server:
            mcp_tools = await server.list_tools()
            count += len(mcp_tools)
    print(f"We have {len(all_params)} MCP servers, and {count} tools")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

**Advanced Trader Features:**

- **Real-Time Streaming**: Watch AI responses appear token-by-token as they're generated
- **Visual Tool Tracking**: See exactly when tools are called and completed
- **MCP Server Analytics**: Count and track all available servers and tools
- **Professional Trading**: Advanced autonomous trading with research integration
- **Enhanced Monitoring**: Real-time feedback with visual separators and emojis
- **Portfolio Management**: Complete account state tracking and reporting

**Streaming Output Example:**
```bash
🤖 Daniel is analyzing the market...

================================================================================
I'll research the latest market conditions and identify trading opportunities...

🔧 [Tool called]
✅ [Tool completed]
Based on my research, I'll check current stock prices...

🔧 [Tool called]
✅ [Tool completed]
I've executed the following trades:
1. Sold 1 share of TSLA at $407.76, locking in profits due to market volatility.
2. Placed buy orders for 3 shares of MSFT and 5 shares of ENPH...
--------------------------------------------------------------------------------

================================================================================

✨ Daniel finished trading session
📊 Final output: Trading session completed successfully...
We have 6 MCP servers, and 16 tools
```

**Technical Implementation:**

- **Runner.run_streamed()**: Uses OpenAI Agents streaming API for real-time output
- **ResponseTextDeltaEvent**: Captures each token as it's generated
- **Safe Event Handling**: Robust error handling for different event types
- **Tool Call Tracking**: Visual feedback for all MCP tool interactions
- **MCP Analytics**: Comprehensive server and tool inventory

**Trader Capabilities:**

- **Market Research**: Real-time web search and analysis
- **Price Monitoring**: Live stock price checking
- **Trade Execution**: Automated buy/sell decisions with rationale
- **Portfolio Tracking**: Complete balance and holdings management
- **Risk Management**: Profit-taking and strategic positioning
- **Performance Analytics**: Real-time P&L tracking

**Use Cases:**

- Professional trading automation
- Real-time market monitoring
- Portfolio management with AI insights
- Risk-managed investment execution
- Trading strategy testing and optimization
- Market research-driven decision making

**Streaming Benefits:**

- **Immediate Feedback**: See AI thinking process in real-time
- **Transparency**: Watch exactly how trading decisions are made
- **Debugging**: Identify and troubleshoot issues instantly
- **User Experience**: Interactive and engaging trading sessions
- **Monitoring**: Real-time progress tracking without waiting

## 🖥️ Trading Dashboard UI

### Web Dashboard with Gradio

The project includes a comprehensive web dashboard built with Gradio that provides real-time monitoring of multiple AI trading agents:

```python
# app.py - Web dashboard for monitoring trading agents
import gradio as gr
from src.util import css, js, Color
import pandas as pd
from src.trading_floor import names, lastnames, short_model_names
import plotly.express as px
from src.accounts import Account
from src.database import read_log

# Create UI with real-time updates
ui = create_ui()
ui.launch(inbrowser=True)
```

**Dashboard Features:**

- **Multi-Agent Monitoring**: Track Warren, George, Ray, and Cathie simultaneously
- **Real-Time Portfolio Charts**: Interactive Plotly charts showing portfolio performance
- **Live Transaction Logs**: Real-time trading activity and decision rationale
- **Portfolio Holdings**: Current positions and quantities
- **Performance Metrics**: P&L tracking with color-coded indicators
- **Auto-Refresh**: 2-minute interval updates for portfolio data
- **Log Streaming**: 0.5-second interval updates for trading logs

**UI Components:**

```python
class TraderView:
    def make_ui(self):
        with gr.Column():
            # Trader title with model info
            gr.HTML(self.trader.get_title())
            
            # Portfolio value with P&L indicator
            self.portfolio_value = gr.HTML(self.trader.get_portfolio_value)
            
            # Interactive portfolio chart
            self.chart = gr.Plot(self.trader.get_portfolio_value_chart)
            
            # Real-time trading logs
            self.log = gr.HTML(self.trader.get_logs)
            
            # Holdings and transactions tables
            self.holdings_table = gr.Dataframe(...)
            self.transactions_table = gr.Dataframe(...)
```

**Chart Styling:**
- Blue line charts matching professional trading interfaces
- Grid overlays for better readability
- Hover tooltips for detailed value inspection
- Responsive design with proper formatting

**Data Integration:**
- SQLite database for persistent storage
- Real-time log streaming from trading activities
- Portfolio value time series tracking
- Transaction history with rationale

### Automated Trading Floor

The `trading_floor.py` module orchestrates multiple trading agents with configurable scheduling:

```python
# src/trading_floor.py - Multi-agent trading orchestration
from .traders import Trader
from .tracers import LogTracer
from agents import add_trace_processor
from .market import is_market_open

# Create and run multiple traders
traders = create_traders()  # Warren, George, Ray, Cathie
await asyncio.gather(*[trader.run() for trader in traders])
```

**Trading Floor Configuration:**

Environment variables control trading behavior:
```bash
# Trading frequency
RUN_EVERY_N_MINUTES=60

# Market hours enforcement
RUN_EVEN_WHEN_MARKET_IS_CLOSED=False

# Model diversity
USE_MANY_MODELS=False
```

**Agent Profiles:**

| Trader | Lastname | Default Model | Specialization |
|--------|----------|---------------|----------------|
| Warren | Patience | GPT 4o mini | Value investing |
| George | Bold | GPT 4o mini | Growth trading |
| Ray | Systematic | GPT 4o mini | Algorithmic trading |
| Cathie | Crypto | GPT 4o mini | Digital assets |

**Multi-Model Support:**

When `USE_MANY_MODELS=True`, agents use different AI models:
- GPT 4.1 Mini
- DeepSeek V3
- Gemini 2.5 Flash
- Grok 3 Mini

**Scheduling System:**

```python
async def run_every_n_minutes():
    while True:
        if RUN_EVEN_WHEN_MARKET_IS_CLOSED or is_market_open():
            # Run all traders concurrently
            await asyncio.gather(*[trader.run() for trader in traders])
        else:
            print("Market is closed, skipping run")
        
        # Wait for next cycle
        await asyncio.sleep(RUN_EVERY_N_MINUTES * 60)
```

**Integration with Dashboard:**

- **Database Logging**: All trading activities logged to SQLite
- **Real-Time Updates**: Dashboard refreshes automatically
- **Performance Tracking**: Portfolio value time series
- **Error Handling**: Comprehensive error reporting
- **Market Awareness**: Respects market hours

### Running the Trading System

**1. Start the Trading Floor:**
```bash
# Execute trading agents with scheduling
uv run -m src.trading_floor
```

**2. Launch Dashboard:**
```bash
# Start web dashboard
uv run app.py
```

**3. Monitor Trading:**
- Open http://127.0.0.1:7860 in browser
- Watch real-time portfolio updates
- Monitor trading logs and decisions
- Track P&L performance

## 🤖 AI Agent Features

### Supported Models
- OpenAI GPT models (gpt-4.1-mini, gpt-4o-mini, etc.)
- DeepSeek V3
- Google Gemini
- Grok 3

### Agent Capabilities
- **Account Analysis**: Balance inquiries, holdings review
- **Trading Decisions**: Buy/sell recommendations with rationale
- **Strategy Management**: Dynamic strategy updates
- **Market Analysis**: Real-time data integration
- **Risk Assessment**: Portfolio evaluation and rebalancing

## 🔄 Trading Workflow

1. **Account Creation**: Initialize with $10,000 starting balance
2. **Market Analysis**: Agent analyzes market conditions
3. **Trade Execution**: Buy/sell decisions with rationale
4. **Portfolio Tracking**: Real-time value and P&L monitoring
5. **Strategy Adjustment**: Dynamic strategy updates
6. **Notification**: Alerts for significant events

## 📊 Data Storage

### Database Schema

- **accounts**: Account data, holdings, transactions
- **logs**: Operation logs with trace IDs
- **market**: Market data cache for performance

### Account Data Structure

```json
{
  "name": "ed",
  "balance": 9711.42,
  "strategy": "value investing",
  "holdings": {"AMZN": 12},
  "transactions": [
    {
      "symbol": "AMZN",
      "quantity": 3,
      "price": 35.07,
      "timestamp": "2026-02-26 21:40:56",
      "rationale": "Because this bookstore website looks promising"
    }
  ],
  "portfolio_value_time_series": [...],
  "total_portfolio_value": 10683.42,
  "total_profit_loss": 683.42
}
```

## 🔍 Monitoring & Logging

### Tracing System
- Automatic trace ID generation for operations
- Structured logging to database
- Performance monitoring and debugging

### Available Logs

- Account operations
- Trade executions
- Agent decisions
- System errors

## 🚀 Advanced Features

### Multi-Model Trading

- Support for multiple AI models simultaneously
- Model comparison and performance tracking
- Ensemble trading decisions

### Real-time Market Data

- Polygon.io integration for live prices
- End-of-day data fallback
- Technical indicators and fundamentals

### Push Notifications

- Trade alerts via Pushover
- Portfolio milestone notifications
- System status updates

## 🧪 Testing

Run the examples to verify functionality:

```bash
# Basic account operations test
uv run example1.py

# Account with MCP server test
uv run example2.py

# Account + market data test
uv run example3.py

# Account + market + notifications test
uv run example4.py

# Basic AI trading agent test
uv run example5.py

# Advanced error handling test
uv run example6.py

# Financial researcher agent test
uv run example7.py

# Autonomous trader agent test
uv run example8.py

# Advanced trader with streaming test
uv run example9.py

# Web dashboard test
uv run app.py

# Trading floor orchestration test
uv run -m src.trading_floor
```

## �️ Error Handling Best Practices

The project demonstrates comprehensive error handling patterns for MCP integrations:

### **Pre-execution Validation**
```python
# Validate API key before proceeding
brave_api_key = os.getenv("BRAVE_API_KEY")
if not brave_api_key or brave_api_key == "your_brave_api_key":
    print("❌ ERROR: BRAVE_API_KEY is not configured!")
    exit(1)
```

### **Structured Error Reporting**
Use template-based error extraction to capture complete API error details:
- Error message and code
- Component and status information
- Error type classification
- Specific troubleshooting steps

### **Agent Instructions for Transparency**
Force agents to report technical errors explicitly:
```python
instructions = """
CRITICAL ERROR REPORTING RULES:
When you encounter ANY error, you MUST:
1. Start with "⚠️ API ERROR DETECTED:"
2. Quote the EXACT error message
3. Explain what this error means
4. Provide specific steps to fix it
"""
```

## 🔮 Future Enhancements

- [x] Memory persistence implementation with libsql
- [x] Web search integration with Brave Search API
- [x] Advanced error handling and transparent reporting
- [x] Financial researcher agent with multi-server integration
- [x] Autonomous trader agent with research tool integration
- [x] Advanced trader with real-time streaming output
- [x] Web dashboard with real-time monitoring
- [x] Multi-agent trading floor orchestration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests and documentation
5. Submit a pull request

## 📄 License

This project is part of the Python projects portfolio and follows the established coding standards and practices.

## 🔗 Related Projects

This MCP implementation integrates with:
- OpenAI Agents framework
- Polygon.io market data API
- Pushover notification service
- SQLite for data persistence

---
