import asyncio
import os
from typing import Annotated

import gradio as gr
import requests
from dotenv import load_dotenv
from IPython.display import Image, display
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import START, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from typing_extensions import TypedDict
import nest_asyncio
from langchain_community.agent_toolkits import PlayWrightBrowserToolkit
from langchain_community.tools.playwright.utils import create_async_playwright_browser

load_dotenv(override=True)


class State(TypedDict):
    messages: Annotated[list, add_messages]


graph_builder = StateGraph(State)

pushover_token = os.getenv("PUSHOVER_TOKEN")
pushover_user = os.getenv("PUSHOVER_USER")
pushover_url = "https://api.pushover.net/1/messages.json"


def push(content: str, title: str = "Langchain Playwright Result"):
    """Send a push notification to the user"""
    requests.post(
        pushover_url,
        data={
            "token": pushover_token,
            "user": pushover_user,
            "message": content,
            "title": title,
        },
    )


@tool
def send_push_notification(content: str, title: str = "Langchain Search Result") -> str:
    """Useful for when you want to send a push notification."""
    return push(content, title)


nest_asyncio.apply()

async_browser = create_async_playwright_browser(headless=False)  # headful mode
toolkit = PlayWrightBrowserToolkit.from_browser(async_browser=async_browser)
tools = toolkit.get_tools()

for playwright_tool in tools:
    print(f"{playwright_tool.name}={playwright_tool}")

tool_dict = {playwright_tool.name: playwright_tool for playwright_tool in tools}

navigate_tool = tool_dict.get("navigate_browser")
extract_text_tool = tool_dict.get("extract_text")


async def run_playwright(url: str) -> str:
    await navigate_tool.arun({"url": url})
    text = await extract_text_tool.arun({})
    print(text)
    return text


if __name__ == "__main__":
    asyncio.run(run_playwright("https://www.cnn.com"))
