# Shell MCP Server

A lightweight MCP (Model Context Protocol) server that provides shell command execution capabilities and file system access for AI assistants with Docker containerization support.

## Features

- Execute shell commands safely
- Download content from URLs
- Access desktop files via MCP resources
- List available MCP resources via tools
- Read desktop files directly via tools
- Cross-platform support (macOS, Linux, Windows)
- Docker containerization support with volume mounts
- Automatic container cleanup

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

Run the container with Desktop access:

```bash
docker run -i --rm --init -v /Users/thepunisher/Desktop:/host-desktop -e DOCKER_CONTAINER=true shellserver-app
```

For development with volume mount:

```bash
docker run -i --rm --init -v $(pwd):/app -v /Users/thepunisher/Desktop:/host-desktop -e DOCKER_CONTAINER=true shellserver-app
```

**Docker Features:**

- ✅ Automatic container cleanup with `--rm`
- ✅ Proper signal handling with `--init`
- ✅ Desktop access via volume mount at `/host-desktop`
- ✅ Isolated environment for security

## Configuration

### Claude Desktop

Add to your `claude_desktop_config.json`:

**Local Server:**

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

**Docker Server (with Desktop access):**

```json
{
    "mcpServers": {
        "docker-shell": {
            "command": "docker",
            "args": [
                "run",
                "-i",
                "--rm",
                "--init",
                "-v",
                "/Users/thepunisher/Desktop:/host-desktop",
                "-e",
                "DOCKER_CONTAINER=true",
                "shellserver-app"
            ]
        }
    }
}
```

### Windsurf

Add to your `mcp_config.json`:

**Local Server:**

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

**Docker Server (with Desktop access):**
```json
{
    "mcpServers": {
        "docker-shell": {
            "command": "docker",
            "args": [
                "run",
                "-i",
                "--rm",
                "--init",
                "-v",
                "/Users/thepunisher/Desktop:/host-desktop",
                "-e",
                "DOCKER_CONTAINER=true",
                "shellserver-app"
            ],
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
run_command("ls -la /host-desktop")  # Docker: Access Desktop
run_command("ls -la ~/Desktop")      # Local: Access Desktop
```

#### `benign_tool`

Download content from a fixed URL.

```bash
# Example usage via MCP:
benign_tool()
```

### Available Resources

#### `file:///mcpreadme`

Access the mcpreadme.md file from your Desktop.

```bash
# Access via MCP resource:
read_resource("shell", "file:///mcpreadme")
```

## Docker vs Local Server

| Feature | Local Server | Docker Server |
|---------|--------------|---------------|
| **Desktop Access** | `~/Desktop` | `/host-desktop` |
| **Security** | Direct system access | Isolated container |
| **Performance** | Faster startup | Slight overhead |
| **Portability** | System-dependent | Fully portable |
| **Cleanup** | Manual processes | Automatic with `--rm` |

## Troubleshooting

### Common Issues

1. **Docker image not found**
   ```bash
   docker build -t shellserver-app .
   ```

2. **Desktop access denied in Docker**
   - Verify volume mount: `-v /Users/thepunisher/Desktop:/host-desktop`
   - Check file permissions on Desktop

3. **Container not cleaning up**
   - Ensure `--rm` flag is used
   - Manual cleanup: `docker rm $(docker ps -aq)`

4. **MCP server not connecting**
   - Restart Claude Desktop or Windsurf
   - Check configuration syntax
   - Verify Docker daemon is running

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
