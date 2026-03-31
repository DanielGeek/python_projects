"""
Testing & Evaluation Patterns
Building reliable LLM applications
"""

import pytest
from unittest.mock import Mock, patch
from typing import Callable
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import AIMessage
from langsmith import traceable, Client
from dotenv import load_dotenv

load_dotenv()


# === Unit Testing with Mocks ===
