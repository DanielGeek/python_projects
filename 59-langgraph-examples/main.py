"""
LangGraph Core Concepts
StateGraph, nodes, edges, and basic patterns
"""

from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, START, END
from typing_extensions import TypedDict, Annotated
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
import operator
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    pass
