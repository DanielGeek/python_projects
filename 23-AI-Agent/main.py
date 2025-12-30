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

def main():
    # Check if running in Jupyter/IPython environment
    try:
        from IPython import get_ipython
        if get_ipython() is not None:
            # Running in Jupyter/IPython - use display
            display(Markdown("## QUESTION:\n\n" + question))
            
            for i, (competitor, answer) in enumerate(zip(competitors, answers)):
                display(Markdown(f"## ANSWER FROM {competitor.upper()}:\n\n" + answer))
        else:
            # Running in terminal - fallback to print
            print("\n" + "="*50)
            print("QUESTION:")
            print("="*50)
            print(question)
            
            for i, (competitor, answer) in enumerate(zip(competitors, answers)):
                print("\n" + "="*50)
                print(f"ANSWER FROM {competitor.upper()}:")
                print("="*50)
                print(answer)
    except ImportError:
        # IPython not available - fallback to print
        print("\n" + "="*50)
        print("QUESTION:")
        print("="*50)
        print(question)
        
        for i, (competitor, answer) in enumerate(zip(competitors, answers)):
            print("\n" + "="*50)
            print(f"ANSWER FROM {competitor.upper()}:")
            print("="*50)
            print(answer)


if __name__ == "__main__":
    main()
