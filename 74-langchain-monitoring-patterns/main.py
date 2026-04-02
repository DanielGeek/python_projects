"""
Monitoring and Logging for Production
Structured logging, metrics, and alerts
"""

import logging
import json
import time
from datetime import datetime, timezone
from functools import wraps
from typing import Any, Callable
from langchain_openai import ChatOpenAI
from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.messages import HumanMessage
from langsmith import traceable
from dotenv import load_dotenv

load_dotenv()
