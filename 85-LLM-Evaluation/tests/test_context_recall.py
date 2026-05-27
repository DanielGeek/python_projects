import pytest
from ragas.metrics.collections.context_recall import ContextRecall

@pytest.mark.asyncio
@pytest.mark.parametrize("get_data", [
    {
        "question": "How many articles are there in the Selenium webdriver python course?",
        "reference": "23",
    }
], indirect=True)
async def test_context_recall(ragas_llm, get_data):

    context_recall = ContextRecall(llm=ragas_llm)

    score = await context_recall.ascore(
        user_input=get_data.user_input,
        retrieved_contexts=get_data.retrieved_contexts,
        reference=get_data.reference,
    )

    print(score)
    assert score.value >= 0.8, "Context recall score should be 1.0 or higher for perfect recall"
