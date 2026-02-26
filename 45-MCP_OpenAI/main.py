from dotenv import load_dotenv
from agents import Agent, Runner, trace
from agents.mcp import MCPServerStdio
import os

load_dotenv(override=True)

fetch_params = {"command": "uvx", "args": ["mcp-server-fetch"]}


async def main():
    async with MCPServerStdio(
        params=fetch_params, client_session_timeout_seconds=60
    ) as server:
        fetch_tools = await server.list_tools()

    print(fetch_tools)


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
