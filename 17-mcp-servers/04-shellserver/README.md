# Shell MCP Server

A lightweight MCP (Model Context Protocol) server that provides shell command execution capabilities and file system access for AI assistants.

## Features

- Execute shell commands safely
- Download content from URLs
- Access desktop files via MCP resources
- Cross-platform support (macOS, Linux, Windows)
- Docker containerization support

## Installation

### Using uv (Recommended)

```bash
cd /Users/thepunisher/Documents/GitHub/python_projects/17-mcp-servers/04-shellserver
uv sync
```

### Using pip

```bash
pip install -r requirements.txt
```

### Using Docker (Recommended for production)

Build the Docker image:

```bash
docker build -t shellserver-app .
```

Run the container:

```bash
docker run -i --rm shellserver-app
```

For development with volume mount:

```bash
docker run -i --rm -v $(pwd):/app shellserver-app
```

## Configuration

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
    "mcpServers": {
        "shell": {
            "args": [
                "run",
                "--directory",
                "/Users/thepunisher/Documents/GitHub/python_projects/17-mcp-servers/04-shellserver",
                "python",
                "server.py"
            ],
            "command": "/Users/thepunisher/.local/bin/uv"
        }
    }
}
```

### Windsurf

Add to your `mcp_config.json`:

```json
{
    "mcpServers": {
        "shell": {
            "args": [
                "run",
                "--directory",
                "/Users/thepunisher/Documents/GitHub/python_projects/17-mcp-servers/04-shellserver",
                "python",
                "server.py"
            ],
            "command": "/Users/thepunisher/.local/bin/uv",
            "disabled": false
        }
    }
}
```

## Usage

### Available Tools

#### `run_command`

Execute shell commands safely.

```bash
# Example usage via MCP:
run_command("ls -la ~/Desktop")
run_command("python --version")
run_command("git status")
```

#### `download_content`

Download content from URLs.

```bash
# Example usage:
benign_tool()
```

### Available Resources

#### `file:///mcpreadme`

Access the mcpreadme.md file from your Desktop.

```bash
# Access via MCP resource:
read_resource("shell", "file:///mcpreadme")
```

## Useful Commands

### File System Operations

```bash
# List directory contents
ls -la ~/Desktop
ls -d ~/Desktop/*/  # Only directories

# Find files
find . -name "*.py" -type f
find . -type f -name "*.md" | head -10

# File operations
cp source.txt destination.txt
mv old.txt new.txt
rm unwanted.txt
```

### Development Commands

```bash
# Python operations
python --version
pip list
uv run python server.py

# Git operations
git status
git add .
git commit -m "feat: add shell mcp server"
git push origin main

# Process management
ps aux | grep python
kill -9 <PID>
```

### System Information

```bash
# System info
uname -a
df -h
free -h  # Linux
top -l 1 # macOS

# Network
ping google.com
curl -I https://example.com
```

## Security Notes

- Commands are executed with your user permissions
- Be careful with destructive commands (rm, mv, etc.)
- File access is limited to your user's accessible directories
- Always validate inputs before executing commands

## Troubleshooting

### Common Issues

1. **Server won't start**
   - Check if uv is installed: `which uv`
   - Verify the directory path is correct
   - Check Python dependencies: `uv sync`

2. **Command execution fails**
   - Verify command syntax
   - Check file permissions
   - Ensure required tools are installed

3. **File access issues**
   - Check file permissions
   - Verify file paths exist
   - Ensure Desktop directory contains mcpreadme.md

### Debug Mode

To enable debug logging, modify the server.py file:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Development

### Project Structure

```text
04-shellserver/
├── server.py          # Main MCP server
├── requirements.txt   # Python dependencies
├── pyproject.toml     # Project configuration
├── Dockerfile         # Docker configuration
└── README.md         # This file
```

### Adding New Tools

To add new tools to the server:

```python
@mcp.tool()
async def new_tool(param: str) -> str:
    """Description of what this tool does."""
    # Your implementation here
    return result
```

### Testing

Test the server locally:

```bash
uv run python server.py
```

Then use MCP client tools to verify functionality.

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:

- Check the troubleshooting section
- Review MCP documentation: <https://modelcontextprotocol.io/>
- Open an issue on GitHub
