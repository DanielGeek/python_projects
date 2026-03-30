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


class ResearchState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    topic: str
    search_queries: list[str]
    findings: Annotated[list[dict], operator.add]
    analysis: str
    report: str
    quality_score: float
    quality_feedback: str
    iteration: int


# State for individual search tasks (used with Send API)
class SearchTaskState(TypedDict):
    search_query: str
    findings: Annotated[list[dict], operator.add]


# ============================================================
# Node: Supervisor — Plans the research
# ============================================================


def supervisor(state: ResearchState) -> dict:
    """Plans research by generating targeted search queries."""

    response = llm.invoke(
        [
            SystemMessage(
                content=(
                    "You are a research supervisor. Given a topic, generate exactly 3 "
                    "specific search queries that will cover different angles of the topic. "
                    "Return ONLY a JSON array of strings. No markdown formatting."
                )
            ),
            HumanMessage(content=f"Research topic: {state['topic']}"),
        ]
    )

    try:
        queries = json.loads(response.content)
    except json.JSONDecodeError:
        # Fallback: split by newlines
        queries = [
            f"{state['topic']} overview",
            f"{state['topic']} latest developments",
            f"{state['topic']} practical applications",
        ]

    return {
        "search_queries": queries[:3],
        "messages": [
            AIMessage(
                content=f"[SUPERVISOR]: Planned {len(queries)} research queries: {queries}",
                name="supervisor",
            )
        ],
    }
