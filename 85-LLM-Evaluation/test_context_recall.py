import os

import pytest

import httpx
from ragas import SingleTurnSample
from ragas.llms import (
    llm_factory
)
from ragas.metrics.collections.context_recall import ContextRecall

from helpers.clean_chat_completions import CleanOpenAI


from dotenv import load_dotenv

load_dotenv()

model = os.getenv("OPENAI_MODEL")

@pytest.mark.asyncio
async def test_context_recall():

    client = CleanOpenAI(
        api_key=os.getenv("OPENAI_API_KEY")
    )

    ragas_llm = llm_factory(
        model=model,
        client=client,
        temperature=0,
        max_completion_tokens=512,
    )

    context_recall = ContextRecall(
        llm=ragas_llm,
    )

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
            reference_contexts=[
                doc["page_content"]
                    for doc in response_dict.json()["retrieved_docs"]
            ]
    )

    score = await context_recall.ascore(
        user_input=sample.user_input,
        retrieved_contexts=sample.reference_contexts,
        reference=sample.response,
    )

    print(score)
    assert score.value >= 1.0, "Context recall score should be 1.0 or higher for perfect recall"
