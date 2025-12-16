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
    "https://www.mercadopago.com.ar/developers/",
    "https://developers.zoom.us/",
    "https://docs.microsoft.com/en-us/microsoftteams/",
    "https://learn.microsoft.com/en-us/microsoftteams/",
    "https://docs.microsoft.com/en-us/graph/",
    "https://learn.microsoft.com/en-us/graph/",
    "https://developers.google.com/meet",
    "https://developers.google.com/workspace",
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
            "- https://www.mercadopago.com.ar/developers/\n"
            "- https://developers.zoom.us/\n"
            "- https://learn.microsoft.com/en-us/microsoftteams/\n"
            "- https://learn.microsoft.com/en-us/graph/\n"
            "- https://developers.google.com/meet\n"
            "- https://developers.google.com/workspace\n"
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

## Usage
Use the `get_mcp_docs` tool with any of these URLs or use "overview" to start.
"""
    return sources


if __name__ == "__main__":
    server.run(transport="stdio")
