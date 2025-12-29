from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(override=True)
import os

openai_api_key = os.getenv("OPENAI_API_KEY")

if openai_api_key:
    print(f"OpenAI API key exists and begins {openai_api_key[:8]}")
else:
    print("OpenAI API key not set - please add a valid API key to the .env file")


openai = OpenAI()

question = "Please propose a hard, challenging question to assess someone's IQ. Respond only with the question."
messages = [{"role": "user", "content": question}]

response = openai.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages
)

question = response.choices[0].message.content

answer = openai.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": question}]
)

def main():
    print(f"Question: {question}")
    print(f"Answer: {answer.choices[0].message.content}")


if __name__ == "__main__":
    main()
