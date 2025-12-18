import asyncio
from dotenv import load_dotenv
import os

# print(os.getenv("GOOGLE_API_KEY"))

from langchain_core.messages import HumanMessage
from langchain_mcp_adapters.tools import load_mcp_tools
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI

# from langgraph.prebuilt import create_react_agent // Old version
from langchain.agents import create_agent
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

load_dotenv()

# llm = ChatOpenAI(model="gpt-4")
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")

stdio_server_params = StdioServerParameters(
    command="python",
    args=[
        "/Users/thepunisher/Documents/GitHub/python_projects/17-mcp-servers/06-langchain-mcp-adapters/servers/math_server.py"
    ],
)


async def main():
    async with stdio_client(stdio_server_params) as (read, write):
        async with ClientSession(read_stream=read, write_stream=write) as session:
            await session.initialize()
            print("Session initialized")
            tools = await load_mcp_tools(session)
            # tools = await session.list_tools()

            # agent = create_react_agent(llm, tools) // Old version
            agent = create_agent(llm, tools)

            result = await agent.ainvoke(
                {"messages": [HumanMessage(content="What is 54 + 2 * 3?")]}
            )
            print(result["messages"][-1].content)


if __name__ == "__main__":
    asyncio.run(main())
