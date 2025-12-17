# MCP Documentation Server

MCP server for accessing official MCP documentation, Python SDK, Zoom Bot development, Recall.ai, LangChain MCP, Mercado Pago MCP, Microsoft Teams, Google Meet, and FastMCP documentation directly from Windsurf.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd 05-mcp-doc-server
uv sync
```

### 2. Test the Server

Using uv run (recommended):

```bash
uv run python server.py
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
      "args": [
        "run",
        "--directory",
        "/Users/thepunisher/Documents/GitHub/python_projects/17-mcp-servers/05-mcp-doc-server",
        "python",
        "server.py"
      ],
      "command": "uv",
      "disabled": false,
      "env": {}
    }
  }
}
```

## 🔧 Claude configuration

Add this to your Claude MCP configuration file:

```json
{
    "mcpServers": {
        "mcp-docs": {
            "args": [
                "run",
                "--directory",
                "/Users/thepunisher/Documents/GitHub/python_projects/17-mcp-servers/05-mcp-doc-server",
                "python",
                "server.py"
            ],
            "command": "/Users/thepunisher/.local/bin/uv",
            "env": {}
        }
    }
}
```

**Important:** Update the path in `args` to match your actual project location.

## � Troubleshooting

If the MCP server is not loading the new Zoom URLs:

1. **Restart the MCP server:** Toggle the `mcp-docs` switch off and on in Windsurf/Claude
2. **Clear cache:** Delete `__pycache__` and `.venv` folders, then run `uv sync`
3. **Verify configuration:** Ensure the path in the configuration matches your project location
4. **Restart IDE:** Completely restart Windsurf or Claude Desktop if issues persist

## �📚 Available Tools

### `get_mcp_docs`

Fetches documentation from multiple sources including MCP official site, Python SDK, Zoom Bot, Zoom SDK, Recall.ai, LangChain MCP, Mercado Pago MCP, FastMCP, Microsoft Teams, and Google Meet.

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
get_mcp_docs https://learn.microsoft.com/en-us/microsoftteams/platform/
get_mcp_docs https://learn.microsoft.com/en-us/graph/api/
get_mcp_docs https://developers.google.com/meet
get_mcp_docs https://developers.google.com/workspace
get_mcp_docs https://gofastmcp.com/getting-started/welcome
get_mcp_docs https://fastmcp.cloud/
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
- **Microsoft Teams Platform:** <https://learn.microsoft.com/en-us/microsoftteams/>
- **Microsoft Graph API:** <https://learn.microsoft.com/en-us/graph/>
- **Google Meet API:** <https://developers.google.com/meet>
- **Google Workspace APIs:** <https://developers.google.com/workspace>
- **FastMCP Getting Started:** <https://gofastmcp.com/getting-started/welcome>
- **FastMCP Cloud:** <https://fastmcp.cloud/>

## 💡 Features

- Real-time documentation access from multiple sources
- Automatic HTML to Markdown conversion
- Support for 14+ documentation sources
- Error handling and validation
- Zoom Bot development resources
- **Zoom SDK official documentation** (Video SDK, Meeting SDK, API Reference)
- MCP security examples (Mercado Pago MCP)
- **Microsoft Teams and Graph API** (Future multi-platform support)
- **Google Meet and Workspace APIs** (Future multi-platform support)
- **FastMCP documentation** (Getting started guide and cloud platform)
