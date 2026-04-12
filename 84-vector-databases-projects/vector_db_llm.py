import os
from dotenv import load_dotenv
import chromadb
from openai import OpenAI
from chromadb.utils import embedding_functions

load_dotenv()
openai_key = os.getenv("OPENAI_API_KEY")

openai_ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key=openai_key, model_name="text-embedding-3-small"
)

# Initialize the Chroma with persistent
chroma_client = chromadb.PersistentClient(path="./db/chroma_persistent_storage")
collection_name = "document_aq_collection"
collection = chroma_client.get_or_create_collection(
    name=collection_name, embedding_function=openai_ef
)

client = OpenAI(api_key=openai_key)


# =================================
# === For initial setup -- Uncomment (below) all for the first run, and then comment it all out ===
# =================================
# # Function to load documents from a directory
# def load_documents_from_directory(directory_path):
#     print("=== Loading documents from directory ===")
#     documents = []
#     for filename in os.listdir(directory_path):
#         if filename.endswith(".txt"):
#             with open(
#                 os.path.join(directory_path, filename), "r", encoding="utf-8"
#             ) as file:
#                 documents.append({"id": filename, "text": file.read()})
#     return documents


# # Function to split text into chunks
# def split_text(text, chunk_size=1000, chunk_overlap=20):
#     chunks = []
#     start = 0
#     while start < len(text):
#         end = start + chunk_size
#         chunks.append(text[start:end])
#         start = end - chunk_overlap
#     return chunks


# # Load documents from the directory
# directory_path = "./data/new_articles"
# documents = load_documents_from_directory(directory_path)

# # Split the documents into chunks
# chunked_documents = []
# for doc in documents:
#     chunks = split_text(doc["text"])
#     print("==== Splitting docs into chunks ====")
#     for i, chunk in enumerate(chunks):
#         chunked_documents.append({"id": f"{doc['id']}_chunk_{i + 1}", "text": chunk})


# # Function to generate embeddings using OpenAI API
# def get_openai_embeddings(text):
#     print("==== Generating embeddings... ====")
#     response = client.embeddings.create(model="text-embedding-3-small", input=text)
#     embedding = response.data[0].embedding
#     return embedding


# # Generate embeddings for the document chunks
# for doc in chunked_documents:
#     print("==== Generating embeddings... ====")
#     doc["embedding"] = get_openai_embeddings(doc["text"])

# # Upsert documents with embeddings into Chroma
# for doc in chunked_documents:
#     print("==== Inserting chunks into db... ====")
#     collection.upsert(
#         ids=[doc["id"]],
#         documents=[doc["text"]],
#         embeddings=[doc["embedding"]],
#     )


# Function to query documents
def query_documents(question, n_results=2):
    # query_embedding = get_openai_embedding(question)
    results = collection.query(
        query_texts=question,
        n_results=n_results,
    )

    # Extract the relevant chunks and their IDs
    relevant_chunks = [doc for sublist in results["documents"] for doc in sublist]
    doc_ids = [doc_id for sublist in results["ids"] for doc_id in sublist]
    print("==== Returning relevant chunks ====")
    return relevant_chunks, doc_ids
    # for idx, document in enumerate(results["documents"][0]):
    #     doc_id = results["ids"][0][idx]
    #     distance = results["distances"][0][idx]
    #     print(f"Found document chunk: {document} (ID: {doc_id}, Distance: {distance})")


# Function to generate a response from OpenAI
def generate_response(question, relevant_chunks, doc_ids):
    context = "\n\n".join(
        [
            f"[Document {i + 1}] (File: {doc_ids[i]}):\n{chunk}"
            for i, chunk in enumerate(relevant_chunks)
        ]
    )

    system_prompt = f"""You are a multilingual question-answering assistant.

CRITICAL INSTRUCTION:
You MUST respond in the EXACT same language that the user uses in their question.
- If the question is in English, respond in English
- And so on for ANY language

RULES:
1. Use ONLY information from the Context Documents below
2. Do NOT use your training data or general knowledge
3. Do NOT make inferences beyond what is explicitly stated
4. Maximum 3 sentences
5. Always cite sources with document numbers and filenames

JSON FORMAT (respond in question's language):
{{
  "answer": "your answer in the question's language",
  "sources": [
    {{"document_number": 1, "filename": "file.txt"}}
  ]
}}

CONTEXT DOCUMENTS:
{context}"""

    user_prompt = f"""{question}

Remember: Your entire answer must be in the same language as my question above. Return JSON only."""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0,
        response_format={"type": "json_object"},
    )

    answer = response.choices[0].message
    return answer


# question = "フランスの首都は何ですか？"
# question = "give me a brief overview of the articles. Be concise, please."
# question = "Dame un breve resumen de los artículos. Sé conciso, por favor."
# question = "How is the owner of SpaceX?"
question = "What is the age of the owner of SpaceX?"
relevant_chunks, doc_ids = query_documents(question)
answer = generate_response(question, relevant_chunks, doc_ids)

print("==== Answer ====")
print(answer.content)
