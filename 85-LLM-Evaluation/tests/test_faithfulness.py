import pytest
import pytest_asyncio
from ragas import SingleTurnSample
from ragas.metrics.collections.faithfulness import Faithfulness

from helpers.llm_response import load_test_data

path_file_name = "faithfulness/selenium_faithfulness.json"

@pytest.mark.asyncio
@pytest.mark.parametrize("get_data", load_test_data(path_file_name), indirect=True)
async def test_faithfulness(ragas_llm, get_data):
    faithfulness = Faithfulness(llm=ragas_llm)

    score = await faithfulness.ascore(
        user_input=get_data.user_input,
        response=get_data.response,
        retrieved_contexts=get_data.retrieved_contexts,
    )
    print(score)
    assert score.value >= 0.8, "Faithfulness score should be 0.8 or higher for perfect faithfulness"
