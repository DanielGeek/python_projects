from fastmcp import FastMCP

mcp = FastMCP("research-prompt")

# Prompt version (works in Claude Desktop)
@mcp.prompt()
def get_research_prompt(topic: str) -> str:
    """Generate a research prompt for a given topic."""
    return f"Research the topic: {topic}"

# Tool version (works in Windsurf)
@mcp.tool()
def generate_research_prompt(topic: str) -> str:
    """Generate a research prompt for a given topic.
    
    Args:
        topic: The research topic to generate a prompt for
        
    Returns:
        A formatted research prompt string
    """
    return f"Research the topic: {topic}"

if __name__ == "__main__":
    mcp.run(transport="http")
