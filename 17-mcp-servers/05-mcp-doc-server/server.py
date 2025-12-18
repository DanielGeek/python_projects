"""MCP Documentation Server.

This server provides access to MCP official documentation, Python SDK docs,
Zoom Bot development, Recall.ai, LangChain MCP, and Mercado Pago MCP docs.
"""

import httpx
from markdownify import markdownify
from mcp.server.fastmcp import FastMCP

server = FastMCP(name="mcp-docs")

ALLOWED_PREFIXES = [
    "https://modelcontextprotocol.io/",
    "https://github.com/modelcontextprotocol/python-sdk",
    "https://github.com/CoconutJJ/zoom-bot",
    "https://support.zoom.com/",
    "https://www.recall.ai/",
    "https://github.com/langchain-ai/mcpdoc",
    "https://github.com/langchain-ai/langchain-mcp-adapters",
    "https://www.mercadopago.com.ar/developers/",
    "https://developers.zoom.us/",
    "https://docs.microsoft.com/en-us/microsoftteams/",
    "https://learn.microsoft.com/en-us/microsoftteams/",
    "https://docs.microsoft.com/en-us/graph/",
    "https://learn.microsoft.com/en-us/graph/",
    "https://developers.google.com/meet",
    "https://developers.google.com/workspace",
    "https://gofastmcp.com/getting-started/welcome",
    "https://fastmcp.cloud/",
    "https://github.com/punkpeye/awesome-mcp-servers",
    "https://www.odoo.com/",
    "https://apps.odoo.com/",
    "https://help.holded.com/",
    "https://zapier.com/",
    "https://10xerp.com/",
    "https://apidocs.sesametime.com/",
    "https://developers.apideck.com/",
    "https://www.apideck.com/",
    "https://pipedream.com/",
    "https://banaina.com/",
    "https://glama.ai/",
    "https://github.com/microsoft/playwright-mcp",
    "https://github.com/microsoft/playwright",
]

HTTPX_CLIENT = httpx.AsyncClient(follow_redirects=True, timeout=30.0)


@server.tool()
async def get_mcp_docs(url: str = "overview") -> str:
    """Get MCP documentation.

    Always fetch the `overview` first to get available documentation URLs.

    Args:
        url: The URL to fetch. Must start with one of the allowed prefixes
             or be "overview" for the main documentation index.

    Returns:
        Markdown content of the documentation page.
    """
    if url == "overview":
        url = "https://modelcontextprotocol.io/llms.txt"

    # Validate URL prefix
    if not any(url.startswith(prefix) for prefix in ALLOWED_PREFIXES):
        return (
            "Error: Invalid URL. Must start with:\n"
            "- https://modelcontextprotocol.io/\n"
            "- https://github.com/modelcontextprotocol/python-sdk\n"
            "- https://github.com/CoconutJJ/zoom-bot\n"
            "- https://support.zoom.com/\n"
            "- https://www.recall.ai/\n"
            "- https://github.com/langchain-ai/mcpdoc\n"
            "- https://github.com/langchain-ai/langchain-mcp-adapters\n"
            "- https://www.mercadopago.com.ar/developers/\n"
            "- https://developers.zoom.us/\n"
            "- https://learn.microsoft.com/en-us/microsoftteams/\n"
            "- https://learn.microsoft.com/en-us/graph/\n"
            "- https://developers.google.com/meet\n"
            "- https://developers.google.com/workspace\n"
            "- https://gofastmcp.com/getting-started/welcome\n"
            "- https://fastmcp.cloud/\n"
            "- https://github.com/punkpeye/awesome-mcp-servers\n"
            "- https://www.odoo.com/\n"
            "- https://apps.odoo.com/\n"
            "- https://help.holded.com/\n"
            "- https://zapier.com/\n"
            "- https://10xerp.com/\n"
            "- https://apidocs.sesametime.com/\n"
            "- https://developers.apideck.com/\n"
            "- https://www.apideck.com/\n"
            "- https://pipedream.com/\n"
            "- https://banaina.com/\n"
            "- https://glama.ai/\n"
            "- https://github.com/microsoft/playwright-mcp\n"
            "- https://github.com/microsoft/playwright\n"
            'Or use "overview" for the documentation index.'
        )

    try:
        response = await HTTPX_CLIENT.get(url)
        response.raise_for_status()

        if response.status_code == 200:
            # Convert HTML to markdown for better readability
            markdown_content = markdownify(response.text)
            return markdown_content
        else:
            return f"Error: Received status code {response.status_code}"

    except httpx.HTTPStatusError as e:
        return f"HTTP Error: {e.response.status_code} - {e.response.reason_phrase}"
    except httpx.RequestError as e:
        return f"Request Error: {str(e)}"
    except Exception as e:
        return f"Unexpected error while fetching URL: {str(e)}"


@server.tool()
async def list_mcp_doc_sources() -> str:
    """List all available MCP documentation sources.

    Returns:
        A formatted list of documentation sources with their URLs.
    """
    sources = """
# Available MCP Documentation Sources

## Official Documentation
- **MCP Protocol Specification**: https://modelcontextprotocol.io/
- **LLMs.txt Index**: https://modelcontextprotocol.io/llms.txt

## Python SDK
- **GitHub Repository**: https://github.com/modelcontextprotocol/python-sdk
- **README**: https://github.com/modelcontextprotocol/python-sdk/blob/main/README.md

## Zoom Bot Development
- **Zoom Bot Repository**: https://github.com/CoconutJJ/zoom-bot
- **Zoom Support Article**: https://support.zoom.com/hc/es/article?id=zm_kb&sysparm_article=KB0058271

## Zoom SDK Official Documentation
- **SDK References**: https://developers.zoom.us/docs/sdk-references/
- **Video SDK**: https://developers.zoom.us/docs/video-sdk/
- **Meeting SDK**: https://developers.zoom.us/docs/meeting-sdk/
- **API Reference**: https://developers.zoom.us/docs/api/

## Recall.ai
- **How to Build a Zoom Bot**: https://www.recall.ai/blog/how-to-build-a-zoom-bot

## LangChain MCP
- **LangChain MCP Documentation**: https://github.com/langchain-ai/mcpdoc

## LangChain MCP Adapters (Agent Integration)
- **LangChain MCP Adapters**: https://github.com/langchain-ai/langchain-mcp-adapters
- **Installation**: pip install langchain-mcp-adapters
- **Multi-Server Client**: Connect multiple MCP servers to LangGraph agents

## Mercado Pago MCP (Security Example)
- **Mercado Pago MCP Server Overview**: https://www.mercadopago.com.ar/developers/es/docs/mcp-server/overview

## Microsoft Teams (Future Integration)
- **Teams Platform**: https://learn.microsoft.com/en-us/microsoftteams/platform/
- **Graph API**: https://learn.microsoft.com/en-us/graph/api/
- **Teams SDK**: https://learn.microsoft.com/en-us/microsoftteams/platform/tabs/how-to/using-teams-client-sdk

## Google Meet (Future Integration)
- **Meet API**: https://developers.google.com/meet
- **Workspace APIs**: https://developers.google.com/workspace
- **Calendar API**: https://developers.google.com/calendar

## FastMCP
- **Getting Started Guide**: https://gofastmcp.com/getting-started/welcome
- **FastMCP Cloud**: https://fastmcp.cloud/

## ERP & Integration Systems
### Awesome MCP Servers Collection
- **Curated MCP Servers List**: https://github.com/punkpeye/awesome-mcp-servers

### Odoo ERP
- **Official API Documentation**: https://www.odoo.com/documentation/saas-13/api_integration.html
- **Integrations Documentation**: https://www.odoo.com/documentation/saas-16.3/applications/general/integrations.html
- **Odoo Connect Addon**: https://apps.odoo.com/apps/modules/16.0/odoo_connect
- **Odoo 18.0 Documentation (Spanish)**: https://www.odoo.com/documentation/18.0/es_419/

### Holded ERP
- **API Guide**: https://help.holded.com/es/articles/6896051-como-generar-y-utilizar-la-api-de-holded

### Zapier Integrations
- **Holded + Odoo Integration**: https://zapier.com/apps/holded/integrations/odoo

### Ten ERP
- **Official Website**: https://10xerp.com/

### Sesame HR
- **API Documentation**: https://apidocs.sesametime.com/
- **Apideck Connector**: https://developers.apideck.com/apis/hris/sesamehr

### Middleware & Unified APIs
- **Apideck Unified ERP API**: https://www.apideck.com/erp-api

### Integration Examples
- **Odoo + Holded on Pipedream**: https://pipedream.com/apps/odoo/integrations/holded

### Banaina Platform
- **Official Website**: https://banaina.com/

### MCP Platforms & Tools
#### Glama MCP
- **Main Platform**: https://glama.ai/mcp
- **MCP Servers**: https://glama.ai/mcp/servers

#### Microsoft Playwright MCP
- **GitHub Repository**: https://github.com/microsoft/playwright-mcp
- **Main Playwright Repository**: https://github.com/microsoft/playwright

## Usage
Use the `get_mcp_docs` tool with any of these URLs or use "overview" to start.
"""
    return sources


if __name__ == "__main__":
    server.run(transport="stdio")
