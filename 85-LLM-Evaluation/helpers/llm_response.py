import json
from pathlib import Path

import httpx

def load_test_data(path_file_name):
    project_root = Path(__file__).resolve().parent.parent
    test_data_path = project_root/"test_data"/path_file_name

    print(f"Loading test data from: {test_data_path}")

    with open(test_data_path, encoding="utf-8") as file:
        return json.load(file)


async def get_llm_response(question: str):
    async with httpx.AsyncClient() as client_request:
        response = await client_request.post(
            "https://rahulshettyacademy.com/rag-llm/ask",
            json={
                "question": question,
                "chat_history": []
            }
        )

    return response.json()
