from ragas import evaluate
from ragas.metrics import answer_relevancy
from tests.shared_dataset import dataset
import numpy as np
from main import generate_answer
from datasets import Dataset
from openai import OpenAI


def test_answer_relevancy():
    openai_client = OpenAI()
    data = dataset.to_list()
    threshold = 0.5

    # Step 1: Generate all RAG answers first
    print("\n🔹 Generating RAG answers for all questions...")
    all_test_cases = []
    for i, row in enumerate(data):
        print(f"  Generating answer {i + 1}/{len(data)}: {row['question'][:60]}...")
        rag_answer = generate_answer(row["question"])
        all_test_cases.append(
            {
                "question": row["question"],
                "answer": rag_answer,
                "contexts": row["contexts"],
                "ground_truths": [row["reference"]],
                "reference": row["reference"],  # for display later
                "idx": i + 1,
            }
        )

    # Step 2: Evaluate ALL test cases at once (this shows RAGAS progress)
    print("\n🔹 Evaluating with RAGAS (this will show progress per question)...")
    full_dataset = Dataset.from_list(all_test_cases)
    scores = evaluate(full_dataset, metrics=[answer_relevancy])

    # Extract scores
    all_scores = scores["answer_relevancy"]

    # Step 3: Generate LLM reasoning for each answer
    print("\n🔹 Generating detailed analysis with LLM reasoning...")
    details = []
    failed = []

    system_prompt = "You are a helpful evaluator judging relevance."
    sub_questions = [
        "Does the answer attempt to address the user's question?",
        "Does the answer provide relevant and helpful information in response to the question?",
        "Is the answer accurate and correct in the context of the question?",
    ]

    for i, test_case in enumerate(all_test_cases):
        score = all_scores[i]

        # Generate analysis
        analysis = ""
        for sq in sub_questions:
            full_prompt = f"{sq}\n\nQuestion: {test_case['question']}\nAnswer: {test_case['answer']}"
            chat = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                temperature=0,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": full_prompt},
                ],
            )
            analysis += f"\n- {sq}\n  → {chat.choices[0].message.content.strip()}\n"

        status = "PASS" if score >= threshold else "FAIL"
        details.append(
            {
                "idx": test_case["idx"],
                "question": test_case["question"],
                "rag_answer": test_case["answer"],
                "reference": test_case["reference"],
                "score": score,
                "status": status,
                "analysis": analysis,
            }
        )

        if score < threshold:
            failed.append(
                (
                    test_case["idx"],
                    test_case["question"],
                    score,
                    test_case["answer"],
                    test_case["reference"],
                )
            )

    for d in details:
        print(f"\nQ{d['idx']}: {d['question']}")
        print(f"  RAG answer      : {d['rag_answer']}")
        print(f"  Ground truth    : {d['reference']}")
        print(f"  answer_relevancy: {d['score']:.3f} [{d['status']}]")
        print(f"  Reasoning       :{d['analysis']}")

    avg_score = np.mean(all_scores)
    print(f"\nTotal average answer_relevancy: {avg_score:.3f}")

    if failed:
        print("\n❌ Failed questions:")
        for idx, q, s, rag_answer, reference in failed:
            print(
                f"  Q{idx}: {q}\n    Score: {s:.3f}\n    RAG answer: {rag_answer}\n    Reference: {reference}"
            )
    else:
        print("✅ All questions passed the threshold.")

    assert avg_score >= threshold
