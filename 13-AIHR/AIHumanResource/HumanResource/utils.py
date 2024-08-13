import os
from groq import Groq
from dotenv import load_dotenv
from pypdf import PdfReader

load_dotenv()

def get_text(pdf_path):
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"The file at {pdf_path} does not exist.")
    
    pdf_reader = PdfReader(pdf_path)
    text = ""

    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

def consult_ai():
  
  client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
  completion = client.chat.completions.create(
      model="llama3-70b-8192",
      messages=[
          {
              "role": "user",
              "content": "What is C++"
          },
          {
             "role": "assistant",
             "content": "" #"Java is a high-level, class-based, object-oriented programming language that is designed to have as few implementation dependencies as possible."
          }
      ],
      temperature=1,
      max_tokens=1024,
      top_p=1,
      stream=True,
      stop=None,
  )

  for chunk in completion:
      print(chunk.choices[0].delta.content or "", end="")

# consult_ai()

# print("Current working directory:", os.getcwd())
# pdf_path = 'media/cvs/Junior_software_developer.pdf'  # Ajusta la ruta relativa
# absolute_pdf_path = os.path.abspath(pdf_path)
# print("PDF path:", pdf_path)
# print("Absolute PDF path:", absolute_pdf_path)

# if os.path.exists(absolute_pdf_path):
#     print("The file exists.")
# else:
#     print("The file does not exist.")

# print(get_text(absolute_pdf_path))
