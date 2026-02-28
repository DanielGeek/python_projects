from dotenv import load_dotenv
from agents import Agent, Runner, trace
from agents.mcp import MCPServerStdio
import os
from IPython.display import Markdown, display
from datetime import datetime
from polygon import RESTClient
from src.market import get_share_price

load_dotenv(override=True)

# Validate Polygon API key before proceeding
polygon_api_key = os.getenv("POLYGON_API_KEY")
if not polygon_api_key or polygon_api_key == "your_polygon_api_key":
    print("\n❌ ERROR: POLYGON_API_KEY is not configured!")
    print("📝 To fix this:")
    print("   1. Get your API key from: https://polygon.io/pricing")
    print("   2. Add it to your .env file: POLYGON_API_KEY=your_actual_key")
    print("   3. Note: Free plans have limitations on real-time data access")
    print("   4. Run the example again\n")
    exit(1)


params = {
    "command": "uvx",
    "args": [
        "--from",
        "git+https://github.com/polygon-io/mcp_polygon@v0.1.0",
        "mcp_polygon",
    ],
    "env": {"POLYGON_API_KEY": polygon_api_key},
}

instructions = "You answer questions about the stock market."
request = """What's the share price of Apple? Use your get_snapshot_ticker tool to get the latest price.

CRITICAL ERROR REPORTING RULES:
When you encounter ANY error from the get_snapshot_ticker tool, you MUST:
1. Start your response with "⚠️ API ERROR DETECTED:"
2. Quote the EXACT error message you received (including error codes like 422, 401, etc.)
3. Explain what this error means in plain terms
4. Provide specific steps to fix it

Example of correct error reporting:
"⚠️ ERROR TYPE:
Error text: {error_message}
Error request_id: {error_request_id}
Error message: {error_message}

To fix this:
steps to fix it

DO NOT provide generic responses like "I'm unable to access information" without explaining the technical error."""
model = "gpt-4.1-mini"

async def main():
    async with MCPServerStdio(params=params, client_session_timeout_seconds=60) as server:
        mcp_tools = await server.list_tools()
    print(mcp_tools)

    async with MCPServerStdio(params=params, client_session_timeout_seconds=60) as mcp_server:
        agent = Agent(name="agent", instructions=instructions, model=model, mcp_servers=[mcp_server])
        with trace("conversation"):
            result = await Runner.run(agent, request)
        # display(Markdown(result.final_output))
        print(result.final_output)


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
