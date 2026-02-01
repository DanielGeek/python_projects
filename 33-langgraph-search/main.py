from typing import Annotated
from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from dotenv import load_dotenv
from IPython.display import Image, display
import gradio as gr
from langgraph.prebuilt import ToolNode, tools_condition
import requests
import os
from langchain_openai import ChatOpenAI
from typing import TypedDict
from langchain_community.utilities import GoogleSerperAPIWrapper
from langchain_core.tools import tool

load_dotenv(override=True)

serper = GoogleSerperAPIWrapper()

@tool
def search(query: str) -> str:
    """Useful for when you need more information from an online search."""
    return serper.run(query)

search_title = "What is the capital of France?"
# Test the search tool
result = search.invoke(search_title)
# print(result)

pushover_token = os.getenv("PUSHOVER_TOKEN")
pushover_user = os.getenv("PUSHOVER_USER")
pushover_url = f"https://api.pushover.net/1/messages.json"

def push(content: str, title: str = "Langchain Search Result"):
    """Send a push notification to the user"""
    requests.post(pushover_url, data={
        "token": pushover_token,
        "user": pushover_user,
        "message": content,
        "title": title
    })

@tool
def send_push_notification(content: str, title: str = "Langchain Search Result") -> str:
    """Useful for when you want to send a push notification."""
    return push(content, title)

# Test the push tool
send_push_notification.invoke({"content": result, "title": search_title})
print(search_title)
print(result)
