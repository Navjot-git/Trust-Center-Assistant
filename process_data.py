import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.decomposition import PCA
from sklearn.preprocessing import normalize
import numpy as np
import pickle


# Load data (replace 'path/to/your-data.csv' with your data file)
df = pd.read_csv('Security Vulnerabilities.csv')

# Load pre-trained embedding model
model = SentenceTransformer('paraphrase-MiniLM-L12-v2')

# Generate embeddings and add them as a new column
df['combined_text'] = df['Title'] + ' ' + df['Summary']
df['embeddings'] = df['combined_text'].apply(lambda x: model.encode(x).tolist())

# Convert the embeddings into a NumPy array
original_embeddings = np.stack(df['embeddings'].values)

# Normalize the embeddings
normalized_embeddings = normalize(original_embeddings)  # Normalize to unit length (L2 norm)

# Apply PCA to reduce to 128 dimensions
pca = PCA(n_components=128)
reduced_embeddings = pca.fit_transform(normalized_embeddings)

# Add the reduced embeddings back to the DataFrame
df['embeddings_128'] = reduced_embeddings.tolist()

# Save the PCA model
with open('pca_model.pkl', 'wb') as f:
    pickle.dump(pca, f)

print("PCA model saved!")

df.to_csv('processed_data.csv', index=False)  # Save without the index column


