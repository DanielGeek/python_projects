from dotenv import load_dotenv
from agents import Agent, Runner, trace
from agents.mcp import MCPServerStdio
from IPython.display import display, Markdown

from accounts import Account

load_dotenv(override=True)

account = Account.get("Ed")

account.buy_shares("AMZN", 3, "Because this bookstore website looks promising")

params = {"command": "uv", "args": ["run", "accounts_server.py"]}

instructions = "You are able to manage an account for a client, and answer questions about the account."
request = "My name is Ed and my account is under the name Ed. What's my balance and my holdings?"
model = "gpt-4.1-mini"

async def main():
    print(account)
    print(account.report())
    print(account.list_transactions())
    async with MCPServerStdio(params=params, client_session_timeout_seconds=30) as server:
        mcp_tools = await server.list_tools()
        # print(mcp_tools)
    
    async with MCPServerStdio(params=params, client_session_timeout_seconds=30) as mcp_server:
        agent = Agent(name="account_manager", instructions=instructions, model=model, mcp_servers=[mcp_server])
        with trace("account_manager"):
            result = await Runner.run(agent, request)
        # display(Markdown(result.final_output))
        print(result.final_output)

if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
