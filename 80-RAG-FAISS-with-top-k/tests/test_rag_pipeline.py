import pytest
import sys
import os

# Add the parent directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import generate_answer


@pytest.mark.parametrize(
    "query, expected_keywords",
    [
        ("What is S22?", ["phone", "samsung"]),
        (
            "Does Galaxy s22 support wireless charging?",
            ["wireless", "charging"],
        ),
    ],
)
def test_rag_pipeline_generation(query, expected_keywords):
    answer = generate_answer(query)
    assert answer, "No answer generated."

    if "don't know" in answer.lower():
        return

    for keyword in expected_keywords:
        assert keyword.lower() in answer.lower(), f"Missing keyword {keyword}"
