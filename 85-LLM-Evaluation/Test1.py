import os

from langchain_openai import ChatOpenAI
from ragas.llms import (
    # LangchainLLMWrapper, # Deprecated
    llm_factory # Recommended alternative
)
# from ragas.metrics.collections import LLMContextPrecisionWithoutReference
from ragas.metrics.collections.context_precision import ContextPrecisionWithoutReference
# from ragas.metrics import LLMContextPrecisionWithoutReference
from dotenv import load_dotenv

load_dotenv()

model = os.getenv("OPENAI_MODEL")

# user_input -> query
# response -> response
# reference -> Groud truth
# retrieved_context -> Top k retrieved docs

def test_context_precision():
    # Create object of class for that specific metric

    # Power of LLM + method metric -> score
    client = ChatOpenAI(model=model, temperature=0)
    # llm_wrapper = LangchainLLMWrapper(llm=client) # Deprecated way to wrap LLMs

    llm_factory = llm_factory(client=client) # Recommended way to wrap LLMs

    # context_precision = LLMContextPrecisionWithoutReference( # Deprecated way to call the metric
    #     # llm=llm_wrapper, # Deprecated way to pass LLMs to metrics
    # )
    
    context_precision = ContextPrecisionWithoutReference(
        # llm=llm_wrapper, # Deprecated way to pass LLMs to metrics
        llm=llm_factory,
    )

    # Feed data - 
    # Score
