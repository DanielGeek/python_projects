import asyncio
from dotenv import load_dotenv

from langchain_mcp_adapters.client import MultiServerMCPClient

# from langgraph.prebuilt import create_react_agent // Old version
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

# llm = ChatOpenAI(model="gpt-4")
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")


async def main():
    client = MultiServerMCPClient(
        {
            "math": {
                "command": "python",
                "args": [
                    "/Users/thepunisher/Documents/GitHub/python_projects/17-mcp-servers/06-langchain-mcp-adapters/servers/math_server.py"
                ],
                "transport": "stdio",
            },
            "weather": {
                "url": "http://localhost:8000/sse",
                "transport": "sse",
            },
        }
    )
    
    tools = await client.get_tools()
    agent = create_agent(llm, tools)

    # result = await agent.ainvoke(
    #     {"messages": "What is 3+3?"}
    # )
    result = await agent.ainvoke(
        {"messages": "What is the weather like in New York?"}
    )
    print(result["messages"][-1].content)


if __name__ == "__main__":
    asyncio.run(main())
