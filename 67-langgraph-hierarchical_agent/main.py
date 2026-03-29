"""
Hierarchical Agents in LangGraph
Multi-level supervisors with department routing using subgraphs
"""

from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import MessagesState, add_messages
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage
from typing_extensions import TypedDict, Annotated
from typing import Literal
from pydantic import BaseModel, Field
import operator
from dotenv import load_dotenv

load_dotenv()

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)


# ============================================================
# Shared state schema used across all levels
# ============================================================
