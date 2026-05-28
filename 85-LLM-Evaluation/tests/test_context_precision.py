
import pytest

from helpers.llm_response import load_test_data

""""
import os
import httpx
from ragas import SingleTurnSample
from ragas.llms import (
    # LangchainLLMWrapper, # Deprecated
    # llm_factory # Recommended alternative
)
"""
from ragas.metrics.collections.context_precision import ContextPrecisionWithoutReference

""" Deprecated imports -
from langchain_openai import ChatOpenAI
from ragas.metrics import LLMContextPrecisionWithoutReference
"""

# user_input -> query
# response -> response
# reference -> Groud truth
# retrieved_context -> Top k retrieved docs

@pytest.mark.asyncio
@pytest.mark.parametrize("get_data", load_test_data(), indirect=True)
async def test_context_precision(ragas_llm, get_data):
    # Create object of class for that specific metric

    # Power of LLM + method metric -> score

    """ Deprecated approach:
        client = ChatOpenAI(model=model, temperature=0)
        llm_wrapper = LangchainLLMWrapper(llm=client) # Deprecated way to wrap LLMs

        context_precision = LLMContextPrecisionWithoutReference( # Deprecated way to call the metric
            llm=llm_wrapper, # Deprecated way to pass LLMs to metrics
        )
    """

    context_precision = ContextPrecisionWithoutReference(llm=ragas_llm)

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
        user_input=get_data.user_input,
        response=get_data.response,
        retrieved_contexts=get_data.retrieved_contexts,
    )

    print(score)
    assert score.value >= 0.8, "Context Precision score should be 0.8 or higher for good precision"
