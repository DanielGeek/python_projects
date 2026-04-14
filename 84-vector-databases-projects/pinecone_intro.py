import os
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec

load_dotenv()

pinecone_key = os.getenv("PINECONE_API_KEY")

pc = Pinecone(api_key=pinecone_key)

index_name = "developer-quickstart-py"
namespace = f"{index_name}-ns-1"

# Create index only if it doesn't exist
if not pc.has_index(index_name):
    print(f"Creating new index '{index_name}' with 8 dimensions...")
    pc.create_index(
        name=index_name,
        dimension=8,  # Match the dimension of our example vectors
        metric="euclidean",  # cosine, euclidean, or dotproduct
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )
    print(f"Index '{index_name}' created successfully!")
else:
    print(f"Index '{index_name}' already exists. Using existing index.")

index = pc.Index(index_name)

index.upsert(
    vectors=[
        {
            "id": "A",
            "values": [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
            "metadata": {"genre": "comedy", "year": 2020},
        },
        {
            "id": "B",
            "values": [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2],
            "metadata": {"genre": "documentary", "year": 2019},
        },
        {
            "id": "C",
            "values": [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3],
            "metadata": {"genre": "comedy", "year": 2019},
        },
        {
            "id": "D",
            "values": [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4],
            "metadata": {"genre": "drama"},
        },
    ],
    namespace=namespace,
)

results = index.query(
    namespace=namespace,
    vector=[0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15],  # 8 dimensions
    top_k=3,
    filter={"genre": {"$eq": "comedy"}},  # Filter by genre from our metadata
    include_metadata=True,
    include_values=True,
)

print("==== Query Results ====")
print(f"Matches found: {len(results['matches'])}")
for match in results["matches"]:
    print(f"\nID: {match['id']}")
    print(f"Score: {match['score']:.4f}")
    print(f"Metadata: {match['metadata']}")
    if "values" in match:
        print(f"Values: {match['values']}")
