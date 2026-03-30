"""
Project: Multi-Agent Research System
Combines all patterns from previous sections into a working research pipeline.

Patterns used:
- Supervisor architecture
- Parallel execution via Send API
- Shared state / blackboard
- Iterative refinement loop
"""

from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.types import Send
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage
from typing_extensions import TypedDict, Annotated
from typing import Literal
from pydantic import BaseModel, Field
import operator
import json
from dotenv import load_dotenv

load_dotenv()

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
creative_llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)


# ============================================================
# State Schema
# ============================================================
