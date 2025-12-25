# MCP Stytch Notes App

A simple MCP (Model Context Protocol) server for managing notes using FastMCP and Stytch integration.

## Setup

### Prerequisites
- Python 3.8+
- uv (Python package manager)

### Installation
```bash
# Install dependencies
uv pip install -r requirements.txt
```

## Running the Server

### Option 1: Direct Run
```bash
uv run python main.py
```

### Option 2: Using MCP Inspector
```bash
mcp-inspector uv run python main.py
```

The server will start on `http://127.0.0.1:8000` with CORS enabled for all origins.

## Windsurf Configuration

Add the following to your Windsurf MCP configuration (`mcp_config.json`):

```json
{
  "mcp-stytch": {
    "disabled": false,
    "type": "http",
    "url": "http://127.0.0.1:8000/mcp"
  }
}
```

## Available Tools

- `get_my_notes()`: Get all notes for a user
- `add_note(content: str)`: Add a new note for a user

## API Endpoints

The server exposes MCP endpoints at:
- Base URL: `http://127.0.0.1:8000/mcp`
- Transport: HTTP

## Development

The server uses FastMCP with Starlette middleware for CORS support, allowing connections from any origin with full credentials and header support.
