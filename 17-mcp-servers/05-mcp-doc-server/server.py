"""MCP Documentation Server.

This server provides access to MCP official documentation and Python SDK docs.
"""

import httpx
from markdownify import markdownify
from mcp.server.fastmcp import FastMCP

server = FastMCP(name="mcp-docs")

ALLOWED_PREFIXES = [
    "https://modelcontextprotocol.io/",
    "https://github.com/modelcontextprotocol/python-sdk",
]

HTTPX_CLIENT = httpx.AsyncClient(follow_redirects=True, timeout=30.0)


@server.tool()
async def get_mcp_docs(url: str = "overview") -> str:
    """Get MCP documentation.

    Always fetch the `overview` first to get available documentation URLs.

    Args:
        url: The URL to fetch. Must start with https://modelcontextprotocol.io/
             or https://github.com/modelcontextprotocol/python-sdk
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

## Usage
Use the `get_mcp_docs` tool with any of these URLs or use "overview" to start.
"""
    return sources


if __name__ == "__main__":
    server.run(transport="stdio")
