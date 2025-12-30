import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from anthropic import Anthropic
from IPython.display import Markdown, display

load_dotenv(override=True)

openai_api_key = os.getenv("OPENAI_API_KEY")

if openai_api_key:
    print(f"OpenAI API key exists and begins {openai_api_key[:8]}")
else:
    print("OpenAI API key not set - please add a valid API key to the .env file")

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

def main():
    # Check if running in Jupyter/IPython environment
    try:
        from IPython import get_ipython
        if get_ipython() is not None:
            # Running in Jupyter/IPython - use display
            display(Markdown("## QUESTION:\n\n" + question))
            display(Markdown("## ANSWER:\n\n" + answer))
        else:
            # Running in terminal - fallback to print
            print("\n" + "="*50)
            print("QUESTION:")
            print("="*50)
            print(question)
            print("\n" + "="*50)
            print("ANSWER:")
            print("="*50)
            print(answer)
    except ImportError:
        # IPython not available - fallback to print
        print("\n" + "="*50)
        print("QUESTION:")
        print("="*50)
        print(question)
        print("\n" + "="*50)
        print("ANSWER:")
        print("="*50)
        print(answer)


if __name__ == "__main__":
    main()
