import asyncio
import logging
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
from playwright.async_api import async_playwright

load_dotenv(override=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


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


# Playwright web scraping tool using playwright.async_api directly
# This creates a fresh browser context per request to avoid event loop conflicts
@tool
async def get_webpage_content(url: str) -> str:
    """Fetch text content from any website including news sites like CNN, BBC, etc.
    
    This tool navigates to the URL and extracts all visible text.
    
    Examples:
    - get_webpage_content("https://www.cnn.com") - Get CNN headlines
    - get_webpage_content("https://www.bbc.com/news") - Get BBC news
    - get_webpage_content("https://en.wikipedia.org/wiki/Python") - Wikipedia
    - get_webpage_content("https://quotes.toscrape.com") - Scraping practice
    
    Args:
        url: The complete URL to fetch (must include http:// or https://)
    
    Returns:
        Text content of the webpage
    """
    
    logger.info(f"🌐 Fetching content from {url}...")
    playwright = None
    browser = None
    try:
        logger.info("🚀 Launching fresh Playwright browser...")
        playwright = await async_playwright().start()
        browser = await playwright.chromium.launch(headless=False)
        
        # Create context with realistic User-Agent
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 720},
        )
        page = await context.new_page()
        
        # Navigate with domcontentloaded (don't wait for all resources)
        logger.info("📍 Step 1: Navigating (domcontentloaded)...")
        await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        logger.info("✅ Navigation completed")
        
        # Wait for JS to render
        logger.info("⏳ Step 2: Waiting 3s for JS rendering...")
        await page.wait_for_timeout(3000)
        
        # Extract all visible text
        logger.info("📄 Step 3: Extracting text...")
        text = await page.inner_text("body")
        logger.info(f"✅ Extracted {len(text)} characters")
        
        # Cleanup
        await context.close()
        await browser.close()
        await playwright.stop()
        
        # Truncate if too long
        if len(text) > 5000:
            logger.info(f"📏 Truncating from {len(text)} to 5000 chars")
            text = text[:5000] + "\n\n[Content truncated...]"
        
        return text
    except Exception as e:
        error_msg = f"❌ Error fetching {url}: {str(e)}"
        logger.error(error_msg, exc_info=True)
        # Cleanup on error
        try:
            if browser:
                await browser.close()
            if playwright:
                await playwright.stop()
        except Exception:
            pass
        return error_msg

# Initialize all tools for LangGraph
# Only Playwright web scraping and notifications
all_tools = [get_webpage_content, send_push_notification]

logger.info(f"✅ Initialized {len(all_tools)} tools total")

llm = ChatOpenAI(model="gpt-4o-mini")
llm_with_tools = llm.bind_tools(all_tools)

async def chatbot(state: State):
    logger.info(f"🤖 Chatbot called with {len(state['messages'])} messages")
    logger.info(f"📝 Last message: {state['messages'][-1] if state['messages'] else 'None'}")
    
    try:
        result = await llm_with_tools.ainvoke(state["messages"])
        logger.info(f"✅ LLM response received: {result}")
        return {"messages": [result]}
    except Exception as e:
        logger.error(f"❌ Error in chatbot: {e}", exc_info=True)
        raise

# Create a custom tool node with logging
def log_tool_execution(state: State):
    logger.info(f"🔧 ToolNode called with {len(state['messages'])} messages")
    last_message = state['messages'][-1]
    if hasattr(last_message, 'tool_calls'):
        logger.info(f"🛠️ Tool calls to execute: {len(last_message.tool_calls)}")
        for tool_call in last_message.tool_calls:
            logger.info(f"   → Tool: {tool_call['name']} with args: {tool_call['args']}")
    return state

async def async_tool_node(state: State):
    logger.info("🔧 Async ToolNode executing...")
    log_tool_execution(state)
    
    # Create ToolNode and execute
    tool_node = ToolNode(tools=all_tools)
    try:
        logger.info("⚙️ Starting tool execution...")
        result = await tool_node.ainvoke(state)
        logger.info(f"✅ Tool execution completed. Messages: {len(result['messages'])}")
        return result
    except Exception as e:
        logger.error(f"❌ Tool execution failed: {e}", exc_info=True)
        raise

graph_builder = StateGraph(State)
graph_builder.add_node("chatbot", chatbot)
graph_builder.add_node("tools", async_tool_node)
graph_builder.add_conditional_edges( "chatbot", tools_condition, "tools")
graph_builder.add_edge("tools", "chatbot")
graph_builder.add_edge(START, "chatbot")

memory = MemorySaver()
graph = graph_builder.compile(checkpointer=memory)

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

config = {"configurable": {"thread_id": "10"}}

async def chat(user_input: str, history):
    logger.info(f"💬 Chat called with input: {user_input}")
    logger.info(f"📚 History length: {len(history) if history else 0}")
    
    try:
        logger.info("🚀 Starting graph.ainvoke...")
        result = await graph.ainvoke({"messages": [{"role": "user", "content": user_input}]}, config=config)
        logger.info(f"✅ Graph completed. Result keys: {result.keys()}")
        logger.info(f"📨 Messages count: {len(result['messages'])}")
        
        response = result["messages"][-1].content
        logger.info(f"📤 Returning response: {response[:100]}...")
        return response
    except Exception as e:
        logger.error(f"❌ Error in chat: {e}", exc_info=True)
        return f"Error: {str(e)}"

if __name__ == "__main__":
    # asyncio.run(run_playwright("https://www.cnn.com"))
    save_graph_image()
    gr.ChatInterface(chat).launch()
