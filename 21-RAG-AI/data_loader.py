from google import genai
from llama_index.readers.file import PDFReader
from llama_index.core.node_parser import SentenceSplitter
from dotenv import load_dotenv
import os

load_dotenv()

# Initialize Google GenAI client for embeddings
# Automatically reads GOOGLE_API_KEY from environment
client = genai.Client()
EMBED_MODEL = "text-embedding-004"
EMBED_DIM = 768  # Gemini text-embedding-004 dimension

splitter = SentenceSplitter(chunk_size=1000, chunk_overlap=200)

def load_and_chunk_pdf(path: str):
    docs = PDFReader().load_data(file=path)
    texts = [d.text for d in docs if getattr(d, "text", None)]
    chunks = []
    for t in texts:
        chunks.extend(splitter.split_text(t))
    return chunks


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Generate embeddings using Google Gemini text-embedding-004"""
    embeddings = []
    for text in texts:
        response = client.models.embed_content(
            model=EMBED_MODEL,
            contents=text
        )
        embeddings.append(response.embeddings[0].values)
    return embeddings
