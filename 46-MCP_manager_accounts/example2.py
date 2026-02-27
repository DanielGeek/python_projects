from dotenv import load_dotenv
from agents import Agent, Runner, trace
from IPython.display import display, Markdown
from src.accounts_client import (
    get_accounts_tools_openai,
    read_accounts_resource,
    list_accounts_tools,
)

from src.accounts import Account

load_dotenv(override=True)

instructions = "You are able to manage an account for a client, and answer questions about the account."
request = "My name is Ed and my account is under the name Ed. What's my balance and my holdings?"
model = "gpt-4.1-mini"


async def main():
    mcp_tools = await list_accounts_tools()
    print(mcp_tools)
    openai_tools = await get_accounts_tools_openai()
    print(openai_tools)

    request = "My name is Ed and my account is under the name Ed. What's my balance?"

    with trace("account_mcp_client"):
        agent = Agent(
            name="account_manager",
            instructions=instructions,
            model=model,
            tools=openai_tools,
        )
        result = await Runner.run(agent, request)
        # display(Markdown(result.final_output))
        print("Result:")
        print(result.final_output)

    context = await read_accounts_resource("ed")
    print("Context:")
    print(context)
    print("Account Report:")
    print(Account.get("ed").report())


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
