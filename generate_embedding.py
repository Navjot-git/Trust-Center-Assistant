import sys
import json
from sentence_transformers import SentenceTransformer
from sklearn.decomposition import PCA
from sklearn.preprocessing import normalize

import pickle


# Load pre-trained model
model = SentenceTransformer('paraphrase-MiniLM-L12-v2')

# Load pre-fitted PCA model
with open('pca_model.pkl', 'rb') as f:
    pca = pickle.load(f)


# Read input text from stdin
input_text = sys.stdin.read()

# Generate embedding
embedding = model.encode(input_text.strip()).tolist()

# Normalize the embedding
normalized_embedding = normalize([embedding])[0].tolist()  # Normalize to unit length

# Apply pre-fitted PCA to reduce dimensionality
embedding_128 = pca.transform([normalized_embedding])[0].tolist()  # PCA expects a 2D array


# Print the embedding as JSON
print(json.dumps(embedding_128))
