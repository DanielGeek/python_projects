# MCP Manager Accounts

A comprehensive Model Context Protocol (MCP) server implementation for managing investment accounts with AI agents.

## 🏗️ Architecture

This project implements a multi-server MCP architecture for automated trading and account management:

```
46-MCP_manager_accounts/
├── src/                          # Source code package
│   ├── accounts_server.py        # MCP server for account operations
│   ├── market_server.py          # MCP server for market data
│   ├── push_server.py            # MCP server for notifications
│   ├── accounts.py               # Account management logic
│   ├── accounts_client.py        # MCP client for accounts
│   ├── database.py               # Database operations
│   ├── market.py                 # Market data integration
│   ├── traders.py                # AI trader implementations
│   ├── trading_floor.py          # Trading orchestration
│   ├── templates.py              # Agent instruction templates
│   ├── tracers.py                # Logging and tracing
│   ├── mcp_params.py             # MCP server configurations
│   └── util.py                   # Utility functions
├── db/                           # Database storage
│   └── accounts.db               # SQLite database
├── example1.py                   # Basic MCP server usage
├── example2.py                   # Advanced AI agent integration
└── pyproject.toml                # Project dependencies
```

## 🚀 Features

### Core Functionality
- **Account Management**: Create, read, update investment accounts
- **Trading Operations**: Buy/sell shares with rationale tracking
- **Market Data Integration**: Real-time and historical market data
- **AI Agent Integration**: OpenAI agents for automated trading
- **Notification System**: Push notifications for trade alerts
- **Transaction Logging**: Complete audit trail with timestamps

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
- **accounts**: Account data and holdings
- **logs**: Transaction and operation logs
- **market**: Market data cache

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
# Basic MCP server test
uv run example1.py

# Advanced AI agent test
uv run example2.py
```

## 🔮 Future Enhancements

- [ ] Additional example implementations
- [ ] Web dashboard for account monitoring
- [ ] Advanced risk management features
- [ ] Portfolio optimization algorithms
- [ ] Backtesting framework
- [ ] Multi-account support
- [ ] Advanced charting and analytics

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

**Note**: This is an active development project. New examples and features will be added as requested. The current implementation focuses on account management and basic trading automation with AI agents.