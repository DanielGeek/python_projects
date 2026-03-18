# Model	                   Dimensions	Cost per 1M tokens	 Best For
# text-embedding-3-small	1536	     $0.02	             General use
# text-embedding-3-large	3072	     $0.13	             High accuracy
# text-embedding-ada-002	1536	     $0.10	             Legacy

from langchain_openai.embeddings import OpenAIEmbeddings

# from langchain_community.embeddings import HuggingFaceEmbeddings # Deprecated
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import OllamaEmbeddings
from dotenv import load_dotenv
import numpy as np

load_dotenv()

openai_embeddings = OpenAIEmbeddings(model="text-embedding-3-small")


def openai_embed_text():
    # single text
    text = "This is a sample text to be embedded."
    embedding = openai_embeddings.embed_query(text)
    print(f"Embedding for single text: {embedding}")

    print(
        f"Length of embedding: {len(embedding)}"
    )  # Should print 1536 for text-embedding-3-small

    # multiple texts
    embeds = openai_embeddings.embed_documents(
        ["This is the first document.", "This is the second document."]
    )
    print(f"Embeddings for multiple texts: {embeds}")
    print(f"Number of embeddings returned: {len(embeds)}")  # Should print 2
    print(
        f"Length of each embedding: {len(embeds[0])}"
    )  # Should print 1536 for text-embedding-3-small


def huggingface_embed_text():
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    # single text
    text = "This is a sample text to be embedded."
    embedding = embeddings.embed_query(text)
    print(f"Embedding for single text: {embedding}")

    print(
        f"Length of embedding: {len(embedding)}"
    )  # Should print 384 for all-MiniLM-L6-v2

    # multiple texts
    embeds = embeddings.embed_documents(
        ["This is the first document.", "This is the second document."]
    )
    print(f"Embeddings for multiple texts: {embeds}")
    print(f"Number of embeddings returned: {len(embeds)}")  # Should print 2
    print(
        f"Length of each embedding: {len(embeds[0])}"
    )  # Should print 384 for all-MiniLM-L6-v2


def ollama_embed_text():
    embeddings = OllamaEmbeddings(model="nomic-embed-text")

    # single text
    text = "This is a sample text to be embedded."
    embedding = embeddings.embed_query(text)
    print(f"Embedding for single text: {embedding}")

    print(f"Length of embedding: {len(embedding)}")  # Should print 768

    # multiple texts
    embeds = embeddings.embed_documents(
        ["This is the first document.", "This is the second document."]
    )
    print(f"Embeddings for multiple texts: {embeds}")
    print(f"Number of embeddings returned: {len(embeds)}")  # Should print 2
    print(f"Length of each embedding: {len(embeds[0])}")  # Should print 768


def normalized_embeddings():

    # Single text
    text = "What is Machine Learning?"
    single_embedding = openai_embeddings.embed_query(text)
    print(f"Vector dimensions: {len(single_embedding)}")
    print(f"First 5 values: {single_embedding[:5]}")
    print(f"Vector norm: {np.linalg.norm(single_embedding):.4f}")


def batch_embeddings():
    text = [
        "What is Machine Learning?",
        "Explain the concept of overfitting in ML.",
        "How does a neural network work?",
    ]

    batch_embedding = openai_embeddings.embed_documents(text)
    for i, emb in enumerate(batch_embedding):
        print(f"Text {i + 1} - Vector dimensions: {len(emb)}")
        print(f"Text {i + 1} - First 5 values: {emb[:5]}")
        print(f"Text {i + 1} - Vector norm: {np.linalg.norm(emb):.4f}")


def similarity_search():

    # Documents
    docs = [
        "Python is a programming language",
        "JavaScript is used for web development",
        "Machine learning enables AI applications",
        "Deep learning uses neural networks",
        "Cats are popular pets",
    ]

    query = "What programming languages exist?"

    # embed documents and query
    doc_vector = openai_embeddings.embed_documents(docs)
    query_vector = openai_embeddings.embed_query(query)

    # compute cosine similarities
    def cosine_similarity(vec1, vec2):
        return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

    similarities = [cosine_similarity(query_vector, doc_vec) for doc_vec in doc_vector]

    # rank documents by similarity
    ranked_docs = sorted(zip(docs, similarities), key=lambda x: x[1], reverse=True)

    print(f"Query: {query}\n")
    print("Ranked by similarity:")
    for doc, score in ranked_docs:
        print(f"  {score:.4f}: {doc}")


if __name__ == "__main__":
    # openai_embed_text()
    # huggingface_embed_text()
    # ollama_embed_text()
    # normalized_embeddings()
    # batch_embeddings()
    similarity_search()
