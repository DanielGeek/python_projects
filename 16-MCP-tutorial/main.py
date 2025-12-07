from fastmcp import FastMCP
from dotenv import load_dotenv
from startlette.middleware.cors import CORSMiddleware
from startlette.middleware import Middleware

load_dotenv()

mcp = FastMCP(name="Notes App")

@mcp.tool()
def get_my_notes() -> str:
    """Get all notes for a user"""
    return "no notes"

@mcp.tool()
def add_note(content: str) -> str
    """Add a note for a user"""
    return f"added note: {content}"
