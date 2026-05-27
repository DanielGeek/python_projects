import pytest
from ragas.metrics.collections.context_recall import ContextRecall

@pytest.mark.asyncio
async def test_context_recall(ragas_llm, get_data):

    context_recall = ContextRecall(
        llm=ragas_llm,
    )

    score = await context_recall.ascore(
        user_input=get_data.user_input,
        retrieved_contexts=get_data.retrieved_contexts,
        reference=get_data.response,
    )

    print(score)
    assert score.value >= 1.0, "Context recall score should be 1.0 or higher for perfect recall"
