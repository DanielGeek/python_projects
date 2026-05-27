import os
import httpx
import pytest
import pytest_asyncio

from dotenv import load_dotenv
from ragas import SingleTurnSample
from ragas.llms import llm_factory
from helpers.clean_chat_completions import CleanOpenAI

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
        max_completion_tokens=512,
    )


# --------------------
# DATA FIXTURE (ASYNC + PARAMETRIZED)
# --------------------
@pytest_asyncio.fixture
async def get_data(request):
    test_data = request.param

    async with httpx.AsyncClient() as client_request:
        response = await client_request.post(
            "https://rahulshettyacademy.com/rag-llm/ask",
            json={
                "question": test_data["question"],
                "chat_history": []
            }
        )

    data = response.json()

    return SingleTurnSample(
        user_input=test_data["question"],
        response=data["answer"],
        retrieved_contexts=[
            doc["page_content"]
            for doc in data["retrieved_docs"]
        ],
        reference=test_data.get("reference")
    )
