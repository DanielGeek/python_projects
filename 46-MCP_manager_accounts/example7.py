import os
from dotenv import load_dotenv
from agents import Agent, Runner, trace, Tool
from agents.mcp import MCPServerStdio
from IPython.display import Markdown, display
from datetime import datetime
from src.accounts_client import read_accounts_resource, read_strategy_resource
from src.accounts import Account

load_dotenv(override=True)

polygon_api_key = os.getenv("POLYGON_API_KEY")
polygon_plan = os.getenv("POLYGON_PLAN")

is_paid_polygon = polygon_plan == "paid"
is_realtime_polygon = polygon_plan == "realtime"

print(is_paid_polygon)
print(is_realtime_polygon)

if is_paid_polygon or is_realtime_polygon:
    market_mcp = {
        "command": "uvx",
        "args": [
            "--from",
            "git+https://github.com/polygon-io/mcp_polygon@master",
            "mcp_polygon",
        ],
        "env": {"POLYGON_API_KEY": polygon_api_key},
    }
else:
    market_mcp = {"command": "uv", "args": ["run", "src/market_server.py"]}

trader_mcp_server_params = [
    {"command": "uv", "args": ["run", "src/accounts_server.py"]},
    {"command": "uv", "args": ["run", "src/push_server.py"]},
    market_mcp,
]

brave_env = {"BRAVE_API_KEY": os.getenv("BRAVE_API_KEY")}

researcher_mcp_server_params = [
    {"command": "uvx", "args": ["mcp-server-fetch"]},
    {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-brave-search"],
        "env": brave_env,
    },
]

researcher_mcp_servers = [
    MCPServerStdio(params, client_session_timeout_seconds=30)
    for params in researcher_mcp_server_params
]
trader_mcp_servers = [
    MCPServerStdio(params, client_session_timeout_seconds=30)
    for params in trader_mcp_server_params
]
mcp_servers = trader_mcp_servers + researcher_mcp_servers

async def get_researcher(mcp_servers) -> Agent:
    instructions = f"""You are a financial researcher. You are able to search the web for interesting financial news,
look for possible trading opportunities, and help with research.
Based on the request, you carry out necessary research and respond with your findings.
Take time to make multiple searches to get a comprehensive overview, and then summarize your findings.
If there isn't a specific request, then just respond with investment opportunities based on searching latest news.
The current datetime is {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}


CRITICAL ERROR REPORTING RULES:
When you encounter ANY error from the get_snapshot_ticker tool, you MUST:
1. Start your response with "⚠️ API ERROR DETECTED:"
2. Quote the EXACT error message you received (including error codes like 422, 401, etc.)
3. Explain what this error means in plain terms
4. Provide specific steps to fix it

Example of correct error reporting:
"⚠️ ERROR TYPE:
Error: "error_message"
Error Code: "error_code"
Error Detail: "error_reason"
Error Component: "error_component"
Error Status: "error_status"
Error Type: "error_type"

To fix this:
steps to fix it
DO NOT provide generic responses like "I'm unable to access information" without explaining the technical error.
"""
    researcher = Agent(
        name="Researcher",
        instructions=instructions,
        model="gpt-4.1-mini",
        mcp_servers=mcp_servers,
    )
    return researcher

async def get_researcher_tool(mcp_servers) -> Tool:
        researcher = await get_researcher(mcp_servers)
        return researcher.as_tool(
            tool_name="Researcher",
            tool_description="This tool researches online for news and opportunities, \
                either based on your specific request to look into a certain stock, \
                or generally for notable financial news and opportunities. \
                Describe what kind of research you're looking for."
        )

research_question = "What's the latest news on Amazon?"

async def main():
    for server in researcher_mcp_servers:
        await server.connect()
    researcher = await get_researcher(researcher_mcp_servers)
    with trace("Researcher"):
        result = await Runner.run(researcher, research_question, max_turns=30)
    # display(Markdown(result.final_output))
    print(result.final_output)

    ed_initial_strategy = "You are a day trader that aggressively buys and sells shares based on news and market conditions."
    Account.get("Daniel").reset(ed_initial_strategy)

    # display(Markdown(await read_accounts_resource("Daniel")))
    # display(Markdown(await read_strategy_resource("Daniel")))
    print("read_accounts_resource", await read_accounts_resource("Daniel"))
    print("read_strategy_resource", await read_strategy_resource("Daniel"))

if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
