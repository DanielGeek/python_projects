from openai import OpenAI
from IPython.display import Markdown, display


request = "Please come up with a challenging, nunced question that I can ask a number of LLMs to evaluate their intelligence."
request += "Answer only with the question, no explanation."
messages = [{"role": "user", "content": request}]

ollama = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

model_name = "llama3.2"
response = ollama.chat.completions.create(model=model_name, messages=messages)

answer = response.choices[0].message.content

try:
    from IPython import get_ipython
    if get_ipython() is not None:
        display(Markdown(answer))
    else:
        print(answer)
except:
    print(answer)
