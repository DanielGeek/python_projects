from dotenv import load_dotenv
from typing import Annotated, List
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain.chat_models import init_chat_model 
# from langchain_google_genai import ChatGoogleGenerativeAI
from typing_extensions import TypedDict
from pydantic import BaseModel, Field


load_dotenv()

# ✅ OPTION 1: init_chat_model with explicit provider (RECOMMENDED)
llm = init_chat_model("gemini-2.5-flash", model_provider="google_genai")

# ✅ OPTION 2: Format provider:model
# llm = init_chat_model("google_genai:gemini-2.5-flash")

# ✅ OPTION 3: Direct class (previous form)
# llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")

# For OpenAI:
# llm = init_chat_model("gpt-4o")

class State(TypedDict):
    messages: Annotated[List, add_messages]
    user_question: str | None
    google_results: str | None
    bing_results: str | None
    reddit_results: str | None
    selected_reddit_urls: List[str] | None
    reddit_post_data: list | None
    google_analysis: str | None
    bing_analysis: str | None
    final_answer: str | None

def google_search(state: State):
    return

def bing_search(state: State):
    return

def reddit_search(state: State):
    return

def analyze_reddit_posts(state: State):
    return

def retrieve_reddit_posts(state: State):
    return

def analyze_google_results(state: State):
    return

def analyze_bing_results(state: State):
    return

def analyze_reddit_results(state: State):
    return

def synthesize_analyses(state: State):
    return

graph_builder = StateGraph(State)

graph_builder.add_node("google_search", google_search)
graph_builder.add_node("bing_search", bing_search)
graph_builder.add_node("reddit_search", reddit_search)
graph_builder.add_node("analyze_reddit_posts", analyze_reddit_posts)
graph_builder.add_node("retrieve_reddit_posts", retrieve_reddit_posts)
graph_builder.add_node("analyze_google_results", analyze_google_results)
graph_builder.add_node("analyze_bing_results", analyze_bing_results)
graph_builder.add_node("analyze_reddit_results", analyze_reddit_results)
graph_builder.add_node("synthesize_analyses", synthesize_analyses)

graph_builder.add_edge(START, "google_search")
graph_builder.add_edge(START, "bing_search")
graph_builder.add_edge(START, "reddit_search")

graph_builder.add_edge("google_search", "analyze_reddit_posts")
graph_builder.add_edge("bing_search", "analyze_reddit_posts")
graph_builder.add_edge("reddit_search", "analyze_reddit_posts")
