# A Simple MCP Weather Server written in Python

See the [Quickstart](https://modelcontextprotocol.io/quickstart) tutorial for more information.

## Installation

```bash
uv sync
```

## Running the Server

```bash
uv run python weather.py
```

## Testing the Server

### Local Testing

```bash
# Run the local test script
uv run python test_weather.py
```

### MCP Inspector

```bash
# Install MCP Inspector (if not already installed)
npm install -g @modelcontextprotocol/inspector

# Run with inspector
mcp-inspector uv run python weather.py
```

## Available Tools

**1. get-alerts** - Get weather alerts for a US state (e.g., "CA", "NY")

**2. get-forecast** - Get weather forecast for coordinates (latitude, longitude)

## Communication Method

**STDIO (Standard Input/Output)** transport using JSON-RPC 2.0 protocol

## MCP Configuration

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "weather-python": {
      "command": "/ABSOLUTE/PATH/TO/uv",
      "args": [
        "run",
        "--directory",
        "/ABSOLUTE/PATH/TO/02-weather-server-python",
        "python",
        "weather.py"
      ],
      "disabled": false
    }
  }
}
```

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "weather-python": {
      "command": "/ABSOLUTE/PATH/TO/uv",
      "args": [
        "run",
        "--directory",
        "/ABSOLUTE/PATH/TO/02-weather-server-python",
        "python",
        "weather.py"
      ]
    }
  }
}
```

**Note:** Replace `/ABSOLUTE/PATH/TO/` with your actual paths. Use `which uv` to find your uv path.
