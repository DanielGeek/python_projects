import os
from typing import List, Optional

import pytest
import pytest_asyncio
from dotenv import load_dotenv
from ragas import SingleTurnSample
from ragas.embeddings.base import embedding_factory
from ragas.llms import llm_factory
from ragas.messages import HumanMessage, AIMessage
from helpers.chat_completions import CleanOpenAI
from helpers.llm_response import get_llm_response

load_dotenv()


# --------------------
# TEST DATA WRAPPER
# --------------------
class TestSample:
    """
    Wraps a SingleTurnSample and adds extra fields (conversation, reference_topics)
    without breaking backward compatibility.

    All attribute access that does not exist on TestSample itself
    is forwarded to the underlying SingleTurnSample.
    """
    def __init__(self, sample: SingleTurnSample, conversation: list, reference_topics: list = None):
        self.sample = sample
        self.conversation = conversation
        self.reference_topics = reference_topics

    def __getattr__(self, name):
        return getattr(self.sample, name)


# --------------------
# LLM FIXTURE
# --------------------
@pytest.fixture
def ragas_llm():
    client = CleanOpenAI(
        api_key=os.getenv("OPENAI_API_KEY")
    )

    return llm_factory(
        model=os.getenv("OPENAI_MODEL"),
        client=client,
        temperature=0,
        max_completion_tokens=1024,
    )


@pytest.fixture
def ragas_embedding():
    return embedding_factory(
        provider="openai",
        model=os.getenv("OPENAI_EMBEDDING_MODEL"),
        client=CleanOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        ),
        interface="modern"
    )


# --------------------
# DATA FIXTURE (ASYNC + PARAMETRIZED)
# --------------------
@pytest_asyncio.fixture
async def get_data(request):
    test_data = request.param

    data = await get_llm_response(test_data["question"])

    # Build the SingleTurnSample (used by all existing metrics)
    reference = test_data.get("reference")
    if reference is None:
        reference = test_data.get("reference_topics")

    reference_value = None
    if isinstance(reference, str):
        reference_value = reference
    elif reference:
        reference_value = ", ".join(reference)

    sample = SingleTurnSample(
        user_input=test_data["question"],
        response=data["answer"],
        retrieved_contexts=[
            doc["page_content"]
            for doc in data["retrieved_docs"]
        ],
        reference=reference_value,
    )

    # Wrap it with extra fields for metrics that need them (e.g. TopicAdherence)
    return TestSample(
        sample=sample,
        conversation=[
            HumanMessage(content=test_data["question"]),
            AIMessage(content=data["answer"]),
        ],
        reference_topics=test_data.get("reference_topics") if test_data.get("reference_topics") else test_data.get("reference"),
    )
