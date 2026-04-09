import os, pickle, sys
from typing import List, Dict
import numpy as np
import fitz  # PyMuPDF
import faiss
from tqdm import tqdm
import openai
from dotenv import load_dotenv

load_dotenv()


# ─────────────────────────────────────
# CONFIG
# ─────────────────────────────────────
DOCS_DIR = "../Documents"

DB_DIR = "faiss_index"
INDEX_FILE = os.path.join(DB_DIR, "index.faiss")
META_FILE = os.path.join(DB_DIR, "docs.pkl")

CHUNK_SIZE = 1200
CHUNK_OVERLAP = 300
EMBED_MODEL = "text-embedding-3-small"
MAX_CONTEXTS = 6
LLM_MODEL = "gpt-4o-mini"

SYSTEM_PROMPT = (
    "You are a highly accurate assistant that ONLY uses information from the provided context. "
    "CRITICAL RULES: "
    "1. Answer ONLY based on the exact information in the context provided. "
    "2. Do NOT add information, infer, or make assumptions beyond what is explicitly stated. "
    "3. If the answer is not clearly stated in the context, respond with 'I don't know'. "
    "4. Be concise and direct - use the exact wording from the context when possible. "
    "5. When mentioning product names or models, include the complete name as stated in the context. "
    "6. Never hallucinate or generate information not present in the context."
)


# ─────────────────────────────────────
# DOCUMENT LOADING
# ─────────────────────────────────────
def extract_text_from_pdf(path: str) -> str:
    out = []
    with fitz.open(path) as doc:
        for page in doc:
            out.append(page.get_text("text"))
    return "\n".join(out)


def load_documents(folder: str = DOCS_DIR) -> List[Dict]:
    docs = []
    for fn in os.listdir(folder):
        fp = os.path.join(folder, fn)
        if fn.lower().endswith(".pdf"):
            raw = extract_text_from_pdf(fp)
        elif fn.lower().endswith(".txt"):
            with open(fp, encoding="utf-8") as f:
                raw = f.read()
        else:
            continue
        if raw.strip():
            docs.append({"text": raw, "metadata": {"source": fn}})
    return docs


# ─────────────────────────────────────
# CHUNKING & EMBEDDING
# ─────────────────────────────────────
def split_text(
    text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP
) -> List[str]:
    """Split text into chunks with sentence boundary awareness."""
    chunks = []
    start = 0

    while start < len(text):
        end = min(start + size, len(text))

        # Try to end at sentence boundary if not at end of text
        if end < len(text):
            # Look for sentence endings within last 200 chars
            search_start = max(end - 200, start)
            last_period = text.rfind(". ", search_start, end)
            last_newline = text.rfind("\n", search_start, end)

            # Use the closest sentence boundary
            boundary = max(last_period, last_newline)
            if boundary > start:
                end = boundary + 1

        chunk = text[start:end].strip()
        if chunk:  # Only add non-empty chunks
            chunks.append(chunk)

        start += size - overlap

    return chunks


def embed_texts(texts: List[str], model: str = EMBED_MODEL) -> np.ndarray:
    client = openai.OpenAI()
    all_vecs = []
    batch = 100
    for i in tqdm(range(0, len(texts), batch), desc="Embedding", leave=False):
        resp = client.embeddings.create(input=texts[i : i + batch], model=model)
        all_vecs.extend([d.embedding for d in resp.data])
    arr = np.array(all_vecs, dtype="float32")
    faiss.normalize_L2(arr)
    return arr


# ─────────────────────────────────────
# VECTOR DB
# ─────────────────────────────────────
def create_vector_db(docs: List[Dict]):
    os.makedirs(DB_DIR, exist_ok=True)
    chunks, metas = [], []
    for d in docs:
        for ch in split_text(d["text"]):
            chunks.append(ch)
            metas.append(d["metadata"])
    print(f"Embedding {len(chunks)} chunks …")
    vecs = embed_texts(chunks)
    index = faiss.IndexFlatIP(vecs.shape[1])
    index.add(vecs)
    faiss.write_index(index, INDEX_FILE)
    with open(META_FILE, "wb") as f:
        pickle.dump({"texts": chunks, "meta": metas}, f)
    print("✅ Vector DB built at", DB_DIR)


def load_vector_db():
    if not (os.path.exists(INDEX_FILE) and os.path.exists(META_FILE)):
        raise FileNotFoundError("FAISS DB not found.")
    index = faiss.read_index(INDEX_FILE)
    with open(META_FILE, "rb") as f:
        store = pickle.load(f)
    return index, store["texts"], store["meta"]


# ─────────────────────────────────────
# RETRIEVE + GENERATE
# ─────────────────────────────────────
def retrieve(query: str, k: int = MAX_CONTEXTS):
    """Retrieve relevant contexts with improved relevance filtering."""
    index, texts, meta = load_vector_db()
    q_vec = embed_texts([query])

    # Retrieve more candidates for re-ranking
    search_k = min(k * 3, len(texts))
    D, I = index.search(q_vec, search_k)

    # Filter by relevance score (cosine similarity threshold)
    min_score = 0.3  # Minimum relevance threshold
    candidates = [
        {"text": texts[i], "meta": meta[i], "score": float(D[0][rank])}
        for rank, i in enumerate(I[0])
        if float(D[0][rank]) >= min_score
    ]

    # Return top k most relevant
    return candidates[:k]


def generate_answer(query: str) -> str:
    hits = retrieve(query)
    context = "\n\n".join(h["text"] for h in hits)
    user_prompt = f"Context:\n{context}\n\nQuestion: {query}\nAnswer:"

    if not os.getenv("OPENAI_API_KEY"):
        raise EnvironmentError("OPENAI_API_KEY not set")

    client = openai.OpenAI()
    resp = client.chat.completions.create(
        model=LLM_MODEL,
        temperature=0.2,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
    )
    return resp.choices[0].message.content.strip()


# ─────────────────────────────────────
# OPTIONAL: setup index if missing
# ─────────────────────────────────────
def setup():
    if not os.path.exists(INDEX_FILE):
        docs = load_documents()
        if not docs:
            sys.exit(f"No PDFs/TXTs found in '{DOCS_DIR}'.")
        create_vector_db(docs)


# ─────────────────────────────────────
# MAIN LOOP
# ─────────────────────────────────────
if __name__ == "__main__":
    setup()
    print("✅ RAG Ready. Ask your question (type 'exit' to quit):")
    while True:
        q = input(">>> ").strip()
        if q.lower() == "exit":
            print("👋 Exiting.")
            break
        try:
            a = generate_answer(q)
            print("🧠 Answer:", a)
        except Exception as e:
            print("❌ Error:", e)
