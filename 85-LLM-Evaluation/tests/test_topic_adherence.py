import pytest

from ragas.metrics.collections import TopicAdherence
from helpers.llm_response import load_test_data

# Path to the test data file for the metric
path_file_name = "topic_adherence/selenium_topic_adherence.json"

@pytest.mark.asyncio
@pytest.mark.parametrize("get_data", load_test_data(path_file_name), indirect=True)
async def test_topic_adherence(ragas_llm, get_data):
    topic_adherence = TopicAdherence(llm=ragas_llm)

    # conversation y reference_topics vienen directamente del wrapper TestSample
    score = await topic_adherence.ascore(
        get_data.conversation,
        reference_topics=get_data.reference_topics,
    )

    print(f"\nTopic Adherence Score: {score.value:.4f}")
    assert score.value >= 0.7, (
        f"Topic Adherence score {score.value:.4f} is lower than 0.7"
    )
