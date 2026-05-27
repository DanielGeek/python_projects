import os
from urllib import response
import httpx
import pytest
import pytest_asyncio

from ragas import SingleTurnSample
from ragas.llms import llm_factory
from helpers.clean_chat_completions import CleanOpenAI
from dotenv import load_dotenv

load_dotenv()

@pytest.fixture
def ragas_llm():
    model = os.getenv("OPENAI_MODEL")

    client = CleanOpenAI(
        api_key=os.getenv("OPENAI_API_KEY")
    )

    return llm_factory(
        model=model,
        client=client,
        temperature=0,
        max_completion_tokens=512,
    )

@pytest_asyncio.fixture
async def get_data():
    question = "How many articles are there in the Selenium webdriver python course?"
    # Feed data - 
    async with httpx.AsyncClient() as client_request:
        response_dict = await client_request.post(
            "https://rahulshettyacademy.com/rag-llm/ask",
            json={
                "question": question,
                "chat_history": []
            }
        )
        print(response_dict.json())

    sample = SingleTurnSample(
            user_input=question,
            response=response_dict.json()["answer"],
            retrieved_contexts=[
                doc["page_content"]
                    for doc in response_dict.json()["retrieved_docs"]
            ]
    )

    return sample