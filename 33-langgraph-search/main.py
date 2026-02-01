import os
import sqlite3
from typing import Annotated, TypedDict

import gradio as gr
import requests
from dotenv import load_dotenv
from IPython.display import Image, display
from langchain_community.utilities import GoogleSerperAPIWrapper
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import START, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition

load_dotenv(override=True)

db_path = "db/memory.db"
conn = sqlite3.connect(db_path, check_same_thread=False)
sql_memory = SqliteSaver(conn)
# memory = MemorySaver()

serper = GoogleSerperAPIWrapper()


@tool
def search(query: str) -> str:
    """Useful for when you need more information from an online search."""
    return serper.run(query)


search_title = "What is the capital of France?"
# Test the search tool
# result = search.invoke(search_title)
# print(result)

pushover_token = os.getenv("PUSHOVER_TOKEN")
pushover_user = os.getenv("PUSHOVER_USER")
pushover_url = "https://api.pushover.net/1/messages.json"


def push(content: str, title: str = "Langchain Search Result"):
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


# Test the push tool
# send_push_notification.invoke({"content": result, "title": search_title})
# print(search_title)
# print(result)

tools = [search, send_push_notification]


class State(TypedDict):
    messages: Annotated[list, add_messages]


graph_builder = StateGraph(State)

llm = ChatOpenAI(model="gpt-4o-mini")
llm_with_tools = llm.bind_tools(tools)


def chatbot(state: State):
    return {"messages": llm_with_tools.invoke(state["messages"])}


graph_builder.add_node("chatbot", chatbot)
graph_builder.add_node("tools", ToolNode(tools=tools))

graph_builder.add_conditional_edges("chatbot", tools_condition, "tools")

graph_builder.add_edge("tools", "chatbot")
graph_builder.add_edge(START, "chatbot")

# graph = graph_builder.compile(checkpointer=memory)
graph = graph_builder.compile(checkpointer=sql_memory)
# display(Image(graph.get_graph().draw_mermaid_png()))


def save_graph_image():
    # Generate graph PNG data
    png_data = graph.get_graph().draw_mermaid_png()

    # Save to file
    with open("graph.png", "wb") as f:
        f.write(png_data)
    print("🖼️ Graph saved as 'graph.png'")

    # Print graph as Mermaid diagram (console-friendly)
    print("\n📊 Graph Structure (Mermaid):")
    print(graph.get_graph().draw_mermaid())

    # Print graph information
    print("\n🔍 Graph Details:")
    print(f"Nodes: {list(graph.get_graph().nodes.keys())}")
    print(f"Edges: {list(graph.get_graph().edges)}")

    # Also display in console (if supported)
    try:
        display(Image(png_data))
    except Exception as e:
        print("Display not available in console mode", e)


# save_graph_image()

config = {"configurable": {"thread_id": "3"}}


def chat(user_input: str, history):
    result = graph.invoke(
        {"messages": [{"role": "user", "content": user_input}]}, config=config
    )

    state = graph.get_state(config)
    print("📊 State:", state)

    history = list(graph.get_state_history(config))
    print("📜 State history length:", len(history))
    for i, state in enumerate(history):
        print(f"State {i}: {state}")

    return result["messages"][-1].content


gr.ChatInterface(chat).launch()
