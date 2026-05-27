import os

import pytest

import httpx
from openai.resources.chat.completions import AsyncCompletions
from ragas import SingleTurnSample
from ragas.llms import (
    # LangchainLLMWrapper, # Deprecated
    llm_factory # Recommended alternative
)
from ragas.metrics.collections.context_precision import ContextPrecisionWithoutReference

from helpers.clean_chat_completions import CleanOpenAI

""" Deprecated imports -
from langchain_openai import ChatOpenAI
from ragas.metrics import LLMContextPrecisionWithoutReference
"""

from dotenv import load_dotenv

load_dotenv()

model = os.getenv("OPENAI_MODEL")

# user_input -> query
# response -> response
# reference -> Groud truth
# retrieved_context -> Top k retrieved docs

@pytest.mark.asyncio
async def test_context_precision():
    # Create object of class for that specific metric

    # Power of LLM + method metric -> score

    """ Deprecated approach:
        client = ChatOpenAI(model=model, temperature=0)
        llm_wrapper = LangchainLLMWrapper(llm=client) # Deprecated way to wrap LLMs

        context_precision = LLMContextPrecisionWithoutReference( # Deprecated way to call the metric
            llm=llm_wrapper, # Deprecated way to pass LLMs to metrics
        )
    """

    client = CleanOpenAI(
        api_key=os.getenv("OPENAI_API_KEY")
    )

    ragas_llm = llm_factory(
        model=model,
        client=client,
        temperature=0,
        max_completion_tokens=512,
    )

    context_precision = ContextPrecisionWithoutReference(
        llm=ragas_llm,
    )

    question = "How many articles are there in the Selenium webdriver python course?"
    # Feed data - 
    async with httpx.AsyncClient() as client:
        response_dict = await client.post(
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
                response_dict.json()["retrieved_docs"][0]["page_content"],
                response_dict.json()["retrieved_docs"][1]["page_content"],
                response_dict.json()["retrieved_docs"][2]["page_content"]
            ]
    )

    """ Sample data -
        sample = SingleTurnSample(
            user_input="How many articles are there in the Selenium webdriver python course?",
            response="There are 23 articles in the course.",
            retrieved_contexts=["Complete Understanding on Selenium Python API Methods with real time Scenarios on LIVE "
                                "Websites\n\"Last but not least\" you can clear any Interview and can Lead Entire Selenium "
                                "Python Projects from Design Stage\nThis course includes:\n17.5 hours on-demand "
                                "video\nAssignments\n23 articles\n9 downloadable resources\nAccess on mobile and "
                                "TV\nCertificate of completion\nRequirements",
                                "What you'll learn\n*****By the end of this course,You will be Mastered on Selenium "
                                "Webdriver with strong Core JAVA basics\n****You will gain the ability to design "
                                "PAGEOBJECT, DATADRIVEN&HYBRID Automation FRAMEWORKS from scratch\n*** InDepth "
                                "understanding of real time Selenium CHALLENGES with 100 + examples\n*Complete knowledge on "
                                "TestNG, MAVEN,ANT, JENKINS,LOG4J, CUCUMBER, HTML REPORTS,EXCEL API, GRID PARALLEL TESTING"]
        
        )
    """

    # Score
    """
        Deprecated way to call the scoring method
        score = context_precision.single_turn_ascore(sample)
    """
    score = await context_precision.ascore(
        user_input=sample.user_input,
        response=sample.response,
        retrieved_contexts=sample.retrieved_contexts,
    )

    print(score)
    assert score.value >= 0.8
