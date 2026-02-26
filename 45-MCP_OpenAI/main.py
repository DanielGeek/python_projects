from dotenv import load_dotenv
from agents import Agent, Runner, trace
from agents.mcp import MCPServerStdio
import os

load_dotenv(override=True)

fetch_params = {"command": "uvx", "args": ["mcp-server-fetch"]}

playwright_params = {"command": "npx","args": [ "@playwright/mcp@latest"]}

sandbox_path = os.path.abspath(os.path.join(os.getcwd(), "sandbox"))
files_params = {"command": "npx", "args": ["-y", "@modelcontextprotocol/server-filesystem", sandbox_path]}

instructions = """
You browse the internet to accomplish your instructions.
You are highly capable at browsing the internet independently to accomplish your task, 
including accepting all cookies and clicking 'not now' as
appropriate to get to the content you need. If one website isn't fruitful, try another. 
Be persistent until you have solved your assignment,
trying different options and sites as needed.
When you need to write files, you do that inside the sandbox folder only.
"""

async def main():
    async with MCPServerStdio(
        params=fetch_params, client_session_timeout_seconds=60
    ) as fetch_server:
        fetch_tools = await fetch_server.list_tools()

    # print(fetch_tools)


    async with MCPServerStdio(params=playwright_params, client_session_timeout_seconds=60) as playwright_server:
        playwright_tools = await playwright_server.list_tools()

    # print(playwright_tools)

    async with MCPServerStdio(params=files_params,client_session_timeout_seconds=60) as files_server:
        file_tools = await files_server.list_tools()

    # print(file_tools)

    async with MCPServerStdio(params=files_params, client_session_timeout_seconds=60) as mcp_server_files:
        async with MCPServerStdio(params=playwright_params, client_session_timeout_seconds=60) as mcp_server_browser:
            agent = Agent(
                name="investigator", 
                instructions=instructions, 
                model="gpt-4.1-mini",
                mcp_servers=[mcp_server_files, mcp_server_browser]
                )
            with trace("investigate"):
                result = await Runner.run(agent, "Find a great recipe for Banoffee Pie, then summarize it in markdown to banoffee.md")
                print(result.final_output)



if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
