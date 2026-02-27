from dotenv import load_dotenv
from agents import Agent, Runner, trace
from agents.mcp import MCPServerStdio
import os
from IPython.display import Markdown, display
from datetime import datetime

load_dotenv(override=True)

# Validate API key before proceeding
brave_api_key = os.getenv("BRAVE_API_KEY")
if not brave_api_key or brave_api_key == "your_brave_api_key":
    print("\n❌ ERROR: BRAVE_API_KEY is not configured!")
    print("📝 To fix this:")
    print("   1. Get your API key from: https://api-dashboard.search.brave.com/app/keys")
    print("   2. Add it to your .env file: BRAVE_API_KEY=your_actual_key")
    print("   3. Run the example again\n")
    exit(1)

env = {"BRAVE_API_KEY": brave_api_key}
params = {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-brave-search"],
    "env": env,
}

instructions = """You are able to search the web for information and briefly summarize the takeaways.

CRITICAL ERROR REPORTING RULES:
When you encounter ANY error from the brave_web_search tool, you MUST:
1. Start your response with "⚠️ API ERROR DETECTED:"
2. Quote the EXACT error message you received (including error codes like 422, 401, etc.)
3. Explain what this error means in plain terms
4. Provide specific steps to fix it

Example of correct error reporting:
"⚠️ ERROR TYPE:
Error: {error_message}
Error Code: {error_code}
Error Detail: {error_reason}
Error Component: {error_component}
Error Status: {error_status}
Error Type: {error_type}

To fix this:
steps to fix it

DO NOT provide generic responses like "I'm unable to access information" without explaining the technical error."""
request = f"Please research the latest news on Amazon stock price and briefly summarize its outlook. \
For context, the current date is {datetime.now().strftime('%Y-%m-%d')}"
model = "gpt-4o-mini"

async def main():
    async with MCPServerStdio(
        params=params, client_session_timeout_seconds=30
    ) as server:
        mcp_tools = await server.list_tools()

    print(mcp_tools)

    async with MCPServerStdio(params=params, client_session_timeout_seconds=30) as mcp_server:
        agent = Agent(name="agent", instructions=instructions, model=model, mcp_servers=[mcp_server])
        with trace("conversation"):
            result = await Runner.run(agent, request)
        # display(Markdown(result.final_output))
        print(result.final_output)


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
