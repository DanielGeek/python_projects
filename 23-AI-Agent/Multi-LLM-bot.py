import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from anthropic import Anthropic
from google import genai
from IPython.display import Markdown, display

load_dotenv(override=True)

openai_api_key = os.getenv("OPENAI_API_KEY")
google_api_key = os.getenv("GOOGLE_API_KEY")

if openai_api_key:
    print(f"OpenAI API key exists and begins {openai_api_key[:8]}")
else:
    print("OpenAI API key not set - please add a valid API key to the .env file")

if google_api_key:
    print(f"Google API key exists and begins {google_api_key[:8]}")
    google_client = genai.Client(api_key=google_api_key)
else:
    print("Google API key not set - please add a valid API key to the .env file")
    google_client = None

# Ollama client setup
ollama_client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

request = "Please come up with a challenging, nunced question that I can ask a number of LLMs to evaluate their intelligence."
request += "Answer only with the question, no explanation."
messages = [{"role": "user", "content": request}]

openai = OpenAI()
response = openai.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages
)
question = response.choices[0].message.content

competitors = []
answers = []
messages = [{"role": "user", "content": question}]
model_name = "gpt-4o-mini"
response = openai.chat.completions.create(model=model_name, messages=messages)
answer = response.choices[0].message.content
competitors.append(model_name)
answers.append(answer)

# Google Gemini response
model_name = "gemini-2.5-flash"
response = google_client.models.generate_content(
    model=model_name,
    contents=question
)
answer = response.candidates[0].content.parts[0].text
competitors.append(model_name)
answers.append(answer)

# Ollama response
model_name = "llama3.2"
response = ollama_client.chat.completions.create(model=model_name, messages=messages)
answer = response.choices[0].message.content
competitors.append(model_name)
answers.append(answer)

together = ""
for index, answer in enumerate(answers):
    together += f"# Response from competitor {index+1}\n\n"
    together += answer + "\n\n"

judge = f"""You are judging a competition between {len(competitors)} competitors. Each model has been given this question:
{question}

You job is to evaluate each response for clarity and strength of argument, and rank then in order of best to worst.
Response with JSON, and only JSON, with the following format:
{{"results": ["best competitor number", "second best competitor number", "third best competitor number", ...]}}

Here are the responses from each competitor:
{together}

Now response with JSON with the ranked order of the competitors, nothing else. Do not include markdown formatting or code blocks."""

judge_messages = [{"role": "user", "content": judge}]
openai_judge = OpenAI()
judge_response = openai_judge.chat.completions.create(
    model="o3-mini",
    messages=judge_messages
)

results = judge_response.choices[0].message.content

results_dict = json.loads(results)
ranks = results_dict["results"]
for index, result in enumerate(ranks):
    competitor = competitors[int(result)-1]
    print(f"Rank {index+1}: {competitor}")

def main():
    print(results)

if __name__ == "__main__":
    main()
