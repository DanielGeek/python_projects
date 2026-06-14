import os

import pytest
import pytest_asyncio
from dotenv import load_dotenv
from ragas import SingleTurnSample
from ragas.embeddings.base import embedding_factory
from ragas.llms import llm_factory
from helpers.chat_completions import CleanOpenAI
from helpers.llm_response import get_llm_response

load_dotenv()


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

    return SingleTurnSample(
        user_input=test_data["question"],
        response=data["answer"],
        retrieved_contexts=[
            doc["page_content"]
            for doc in data["retrieved_docs"]
        ],
        reference=test_data.get("reference")
    )
