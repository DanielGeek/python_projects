from dotenv import load_dotenv
from src.accounts_client import read_accounts_resource
from src.traders import Trader
from src.mcp_params import trader_mcp_server_params, researcher_mcp_server_params
from agents.mcp import MCPServerStdio

load_dotenv(override=True)

trader = Trader("Daniel")

all_params = trader_mcp_server_params + researcher_mcp_server_params("Daniel")

async def main():
    await trader.run()
    read_accounts_resource_result = await read_accounts_resource("Daniel")
    print("read_accounts_resource_result", read_accounts_resource_result)

    count = 0
    for each_params in all_params:
        async with MCPServerStdio(params=each_params, client_session_timeout_seconds=60) as server:
            mcp_tools = await server.list_tools()
            count += len(mcp_tools)
    print(f"We have {len(all_params)} MCP servers, and {count} tools")

if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
