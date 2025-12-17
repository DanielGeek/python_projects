# FastMCP Prompts

## What is this project?

This project demonstrates how to create and manage **prompt templates** using FastMCP (Fast Model Context Protocol). It shows how to define reusable prompt templates that can be served through an API endpoint.

## Installation

### 1. Activate virtual environment

```bash
source .venv/bin/activate
```

### 2. Install dependencies

```bash
uv add fastmcp python-dotenv
```

### Quick Setup Commands

```bash
# Create virtual environment
uv venv

# Activate virtual environment
source .venv/bin/activate

# Test environment variables
uv run main.py

# Deactivate virtual environment
deactivate

# Run MCP inspector
npx @modelcontextprotocol/inspector
```

## Project Structure

- `main.py`: Contains the FastMCP server setup and prompt definitions

## Available Prompts & Tools

### `get_research_prompt` (Prompt - Claude Desktop only)
Generates a research prompt for a given topic.

**Parameters:**
- `topic` (str): The research topic

**Example Request:**
```json
{
  "topic": "quantum computing"
}
```

**Example Response:**
```json
{
  "result": "Research the topic: quantum computing"
}
```

### `generate_research_prompt` (Tool - Windsurf compatible)
Same functionality as the prompt version, but exposed as a tool for compatibility with Windsurf and other MCP clients that don't support prompts natively.

**Parameters:**
- `topic` (str): The research topic

**Returns:**
- A formatted research prompt string

## Development

### Adding New Prompts

1. Define a new function with the `@mcp.prompt()` decorator
2. Add type hints for better validation
3. The function name will be used as the endpoint name

Example:
```python
@mcp.prompt()
def generate_summary(text: str, max_length: int = 200) -> str:
    return f"Generate a {max_length}-character summary of: {text}"
```

## MCP Client Configuration

Add this to your MCP client configuration to connect to this server:

```json
"research-prompt-mcp": {
  "disabled": false,
  "url": "http://127.0.0.1:8000/mcp"
}
```

This will make the `generate_research_prompt` tool available in your MCP client.

## License

MIT
