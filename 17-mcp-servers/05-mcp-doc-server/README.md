# MCP Documentation Server

MCP server for accessing official MCP documentation, Python SDK, Zoom Bot development, Recall.ai, LangChain MCP, and Mercado Pago MCP documentation directly from Windsurf.

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

Fetches documentation from multiple sources including MCP official site, Python SDK, Zoom Bot, Zoom SDK, Recall.ai, LangChain MCP, and Mercado Pago MCP.

**Usage:**

```bash
get_mcp_docs overview
get_mcp_docs https://modelcontextprotocol.io/docs/concepts/tools
get_mcp_docs https://github.com/modelcontextprotocol/python-sdk/blob/main/README.md
get_mcp_docs https://github.com/CoconutJJ/zoom-bot
get_mcp_docs https://support.zoom.com/hc/es/article?id=zm_kb&sysparm_article=KB0058271
get_mcp_docs https://developers.zoom.us/docs/sdk-references/
get_mcp_docs https://developers.zoom.us/docs/video-sdk/
get_mcp_docs https://developers.zoom.us/docs/meeting-sdk/
get_mcp_docs https://developers.zoom.us/docs/api/
get_mcp_docs https://www.recall.ai/blog/how-to-build-a-zoom-bot
get_mcp_docs https://github.com/langchain-ai/mcpdoc
get_mcp_docs https://www.mercadopago.com.ar/developers/es/docs/mcp-server/overview
```

### `list_mcp_doc_sources`

Lists all available documentation sources.

## 🌐 Supported URLs

- **MCP Official Documentation:** <https://modelcontextprotocol.io/>
- **Python SDK Repository:** <https://github.com/modelcontextprotocol/python-sdk>
- **Zoom Bot Repository:** <https://github.com/CoconutJJ/zoom-bot>
- **Zoom Support:** <https://support.zoom.com/>
- **Zoom SDK Official:** <https://developers.zoom.us/>
- **Recall.ai Blog:** <https://www.recall.ai/>
- **LangChain MCP:** <https://github.com/langchain-ai/mcpdoc>
- **Mercado Pago MCP:** <https://www.mercadopago.com.ar/developers/>

## 💡 Features

- Real-time documentation access from multiple sources
- Automatic HTML to Markdown conversion
- Support for 8+ documentation sources
- Error handling and validation
- Zoom Bot development resources
- **Zoom SDK official documentation** (Video SDK, Meeting SDK, API Reference)
- MCP security examples (Mercado Pago MCP)
