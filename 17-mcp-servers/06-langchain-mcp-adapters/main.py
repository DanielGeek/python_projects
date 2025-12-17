import asyncio
from dotenv import load_dotenv
import os

load_dotenv()
# print(os.getenv("GOOGLE_API_KEY"))

from langchain_core.messages import HumanMessage
from langchain_mcp_adapters.tools import load_mcp_tools
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# llm = ChatOpenAI(model="gpt-4")
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")

stdio_server_params = StdioServerParameters(
    command="python",
    args=["/Users/thepunisher/Documents/GitHub/python_projects/17-mcp-servers/06-langchain-mcp-adapters/servers/math_server.py"],
)

async def main():
    print("Hello from 06-langchain-mcp-adapters!")
    
    # Test Google AI connection
    try:
        response = await llm.ainvoke("What is MCP protocol in AI?")
        print(f"\n✅ Google AI (Gemini 2.5 Flash) working:")
        print(f"Response: {response.content}")
    except Exception as e:
        print(f"\n❌ Error connecting with Google AI: {e}")


if __name__ == "__main__":
    asyncio.run(main())
