import json

import httpx

def load_test_data():
    file_path = "/Users/thepunisher/Documents/GitHub/python_projects/85-LLM-Evaluation/test_data/data.json"

    with open(file_path, "r") as file:
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
