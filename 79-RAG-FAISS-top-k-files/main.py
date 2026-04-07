import os, pickle
from typing import List, Tuple

import fitz  # PyMuPDF  →  pip install pymupdf
import numpy as np
import faiss  # pip install faiss-cpu
import openai  # pip install openai
from dotenv import load_dotenv

load_dotenv()

DOCS_DIR = "../documents"
DB_DIR = "faiss_index"
DOC_INDEX_FILE = os.path.join(DB_DIR, "doc_index.faiss")
DOC_META_FILE = os.path.join(DB_DIR, "doc_meta.pkl")
EMBED_MODEL = "text-embedding-3-small"  # adjust if needed


# ── helpers ──────────────────────────────────────────────────────────────
def extract_text_from_pdf(path: str) -> str:
    text = []
    with fitz.open(path) as doc:
        for page in doc:
            text.append(page.get_text("text"))
    return "\n".join(text)


def split_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """Split text into chunks to avoid token limits"""
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks


def embed_texts(texts: List[str]) -> np.ndarray:
    client = openai.OpenAI()  # requires OPENAI_API_KEY env-var
    out = []
    for i in range(0, len(texts), 100):  # batch ≤ 100 inputs
        resp = client.embeddings.create(input=texts[i : i + 100], model=EMBED_MODEL)
        out.extend([d.embedding for d in resp.data])
    vecs = np.array(out, dtype="float32")
    faiss.normalize_L2(vecs)  # cosine → inner product
    return vecs


# ── index build / load ───────────────────────────────────────────────────
def build_doc_index(folder: str = DOCS_DIR) -> None:
    os.makedirs(DB_DIR, exist_ok=True)  # Create directory if it doesn't exist

    texts, names = [], []
    for fn in os.listdir(folder):
        fp = os.path.join(folder, fn)
        if fn.lower().endswith(".pdf"):
            full_text = extract_text_from_pdf(fp)
            chunks = split_text(full_text)  # Split into chunks
            for i, chunk in enumerate(chunks):
                texts.append(chunk)
                names.append(f"{fn}_chunk_{i + 1}")
        elif fn.lower().endswith(".txt"):
            full_text = open(fp, encoding="utf-8").read()
            chunks = split_text(full_text)  # Split into chunks
            for i, chunk in enumerate(chunks):
                texts.append(chunk)
                names.append(f"{fn}_chunk_{i + 1}")

    if not texts:
        raise ValueError("No PDFs/TXTs found to index.")

    print(f"Embedding {len(texts)} document chunks …")
    vecs = embed_texts(texts)
    index = faiss.IndexFlatIP(vecs.shape[1])
    index.add(vecs)

    faiss.write_index(index, DOC_INDEX_FILE)
    with open(DOC_META_FILE, "wb") as f:
        pickle.dump(names, f)
    print("✅ doc-level FAISS index saved.")


def load_doc_index():
    if not os.path.exists(DOC_INDEX_FILE):
        build_doc_index()  # auto-build on first use
    index = faiss.read_index(DOC_INDEX_FILE)
    names = pickle.load(open(DOC_META_FILE, "rb"))
    return index, names


# ── public API ───────────────────────────────────────────────────────────
def top_k_docs(query: str, k: int = 5) -> List[Tuple[str, float]]:
    index, names = load_doc_index()
    qvec = embed_texts([query])
    D, I = index.search(qvec, k)
    return [(names[i], float(D[0][rank])) for rank, i in enumerate(I[0])]


# ── demo ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    for fname, score in top_k_docs("wireless charging on Galaxy S22", k=3):
        print(f"{fname}  (score={score:.3f})")
