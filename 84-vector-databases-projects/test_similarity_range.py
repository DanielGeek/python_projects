import numpy as np
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI()


def get_embedding(text):
    response = client.embeddings.create(input=text, model="text-embedding-3-small")
    return np.array(response.data[0].embedding)


test_pairs = [
    ("love", "hate"),
    ("good", "bad"),
    ("hot", "cold"),
    ("up", "down"),
    ("yes", "no"),
    ("happy", "sad"),
    ("light", "dark"),
    ("fast", "slow"),
    ("big", "small"),
    ("technology company", "banana recipe"),
    ("positive sentiment", "negative sentiment"),
    ("success", "failure"),
    ("heaven", "hell"),
    ("peace", "war"),
    ("friend", "enemy"),
]

print("🔬 Testing OpenAI Embedding Similarity Range\n")
print("=" * 80)

min_similarity = 1.0
max_similarity = -1.0
negative_count = 0

results = []

for text1, text2 in test_pairs:
    emb1 = get_embedding(text1)
    emb2 = get_embedding(text2)

    norm1 = np.linalg.norm(emb1)
    norm2 = np.linalg.norm(emb2)

    similarity = np.dot(emb1, emb2)
    distance = 1 - similarity

    min_similarity = min(min_similarity, similarity)
    max_similarity = max(max_similarity, similarity)

    if similarity < 0:
        negative_count += 1

    results.append(
        {
            "text1": text1,
            "text2": text2,
            "similarity": similarity,
            "distance": distance,
            "norm1": norm1,
            "norm2": norm2,
        }
    )

    print(f"{text1:25} vs {text2:25}")
    print(f"  Norm 1: {norm1:.6f}  Norm 2: {norm2:.6f}")
    print(f"  Similarity: {similarity:8.6f}")
    print(f"  Distance:   {distance:8.6f}")
    if similarity < 0:
        print("  ⚠️  NEGATIVE SIMILARITY!")
    print()

print("=" * 80)
print("\n📊 RESULTS:\n")
print(f"Total pairs tested: {len(test_pairs)}")
print(f"Pairs with negative similarity: {negative_count}")
print("\nObserved range:")
print(f"  Similarity: [{min_similarity:.6f}, {max_similarity:.6f}]")
print(f"  Distance:   [{1 - max_similarity:.6f}, {1 - min_similarity:.6f}]")

print("\n🎯 CONCLUSION:\n")
if min_similarity < 0:
    print("✅ CONFIRMED: Similarity CAN be negative with OpenAI embeddings")
    print(f"   Distance range: 0 to {1 - min_similarity:.2f}")
    print("   Theoretical range: [0, 2] ✅")
else:
    print("❌ In these examples: Similarity was NOT negative")
    print(
        f"   Distance range observed: [{1 - max_similarity:.2f}, {1 - min_similarity:.2f}]"
    )
    print(f"   Minimum similarity: {min_similarity:.6f}")

print("\n🔥 Top 3 most OPPOSITE pairs (lowest similarity):\n")
sorted_results = sorted(results, key=lambda x: x["similarity"])
for i, result in enumerate(sorted_results[:3], 1):
    print(f"{i}. {result['text1']} vs {result['text2']}")
    print(f"   Similarity: {result['similarity']:.6f}")
    print(f"   Distance:   {result['distance']:.6f}")
    print()

print("💚 The 3 most SIMILAR pairs (greatest similarity):\n")
sorted_results = sorted(results, key=lambda x: x["similarity"], reverse=True)
for i, result in enumerate(sorted_results[:3], 1):
    print(f"{i}. {result['text1']} vs {result['text2']}")
    print(f"   Similarity: {result['similarity']:.6f}")
    print(f"   Distance:   {result['distance']:.6f}")
    print()
