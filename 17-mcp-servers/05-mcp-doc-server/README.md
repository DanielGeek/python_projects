# MCP Documentation Server

MCP server for accessing official MCP documentation and Python SDK documentation directly from Windsurf.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd 05-mcp-doc-server
uv sync
```

### 2. Test the Server

Using uvx (recommended):

```bash
uvx --from . mcp-doc-server
```

Or activate the virtual environment first:

```bash
source .venv/bin/activate
python server.py
```

## 🔧 Windsurf Configuration

Add this to your Windsurf MCP configuration file:

**Location:** `~/Library/Application Support/Windsurf/User/globalStorage/codeium.codeium/config.json`

```json
{
  "mcpServers": {
    "mcp-docs": {
      "command": "uvx",
      "args": [
        "--from",
        "/Users/thepunisher/Documents/GitHub/python_projects/17-mcp-servers/05-mcp-doc-server",
        "mcp-doc-server"
      ],
      "env": {}
    }
  }
}
```

**Important:** Update the path in `args` to match your actual project location.

## 📚 Available Tools

### `get_mcp_docs`

Fetches documentation from MCP official site or Python SDK repository.

**Usage:**

```bash
get_mcp_docs overview
get_mcp_docs https://modelcontextprotocol.io/docs/concepts/tools
get_mcp_docs https://github.com/modelcontextprotocol/python-sdk/blob/main/README.md
```

### `list_mcp_doc_sources`

Lists all available documentation sources.

## 🌐 Supported URLs

- **MCP Official Documentation:** <https://modelcontextprotocol.io/>
- **Python SDK Repository:** <https://github.com/modelcontextprotocol/python-sdk>

## 💡 Features

- Real-time documentation access
- Automatic HTML to Markdown conversion
- Support for multiple documentation sources
- Error handling and validation
