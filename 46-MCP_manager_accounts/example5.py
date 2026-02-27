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

client = RESTClient(polygon_api_key)
previous_close = client.get_previous_close_agg("AAPL")[0]
print("Previous close:", previous_close)
print("get_share_price:", get_share_price("AAPL"))

for i in range(1000):
    get_share_price("AAPL")
print("get_share_price:", get_share_price("AAPL"))

params = {"command": "uv", "args": ["run", "src/market_server.py"]}

instructions = "You answer questions about the stock market."
request = "What's the share price of Apple?"
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
