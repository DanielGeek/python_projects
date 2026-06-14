import pytest

from helpers.llm_response import load_test_data
from ragas.metrics.collections import AnswerRelevancy, FactualCorrectness

"""
IMPORTANT NOTE: The `AnswerRelevancy` and `FactualCorrectness` classes reside in `ragas.metrics.collections` and inherit from `SimpleBaseMetric`, NOT from `Metric` (the old class).

The `evaluate()` function uses `isinstance(m, `Metric`)` to validate metrics, and since these new classes do NOT inherit from `Metric`, `evaluate()` cannot process them and returns `NaN`.

Solution: Use `ascore()` directly for each metric.
"""

# Path to the test data file for the Relevancy Factual metric
path_file_name = "relevancy_factual/selenium_relevancy_factual.json"

@pytest.mark.asyncio
@pytest.mark.parametrize("get_data", load_test_data(path_file_name), indirect=True)
async def test_relevancy_factual(ragas_llm, ragas_embedding, get_data):
    """
    Evaluates AnswerRelevancy and FactualCorrectness metrics together.
    Uses ascore() directly instead of evaluate() to avoid NaN issue.
    """
    

    # Preliminary data validation
    if not get_data.response:
        pytest.fail("The LLM response is empty; cannot evaluate.")

    # ==========================================
    # 1. AnswerRelevancy
    # ==========================================
    answer_relevancy = AnswerRelevancy(
        llm=ragas_llm,
        embeddings=ragas_embedding,
        strictness=2,  # Keep 2 for speed
    )

    relevancy_score = await answer_relevancy.ascore(
        user_input=get_data.user_input,
        response=get_data.response,
    )

    # ==========================================
    # 2. FactualCorrectness
    # ==========================================
    """
        Use "precision" for a more lenient evaluation, allowing for partial credit if the response contains some correct information even if it's not perfectly aligned with the reference. This is especially useful in cases where the LLM's response may be factually correct but not an exact match to the reference, which can happen due to variations in phrasing or additional context provided by the LLM.
        factual_correctness = FactualCorrectness(llm=ragas_llm, mode="precision")
    """
    factual_correctness = FactualCorrectness(
        llm=ragas_llm,
        mode="f1",
        beta=1.0,
        atomicity="low",
        coverage="low"
    )

    factual_score = await factual_correctness.ascore(
        response=get_data.response,
        reference=get_data.reference,
    )

    # ==========================================
    # 3. Results (same format as before)
    # ==========================================
    print(
        f"\nAnswerRelevancy: {relevancy_score.value:.4f} | "
            f"FactualCorrectness: {factual_score.value:.4f}"
    )

    # Assertions
    assert relevancy_score.value >= 0.9, (
        f"AnswerRelevancy score {relevancy_score.value:.4f} is lower than 0.9"
    )
    assert factual_score.value >= 0.6, (
        f"FactualCorrectness score {factual_score.value:.4f} is lower than 0.6"
    )
