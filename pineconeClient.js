const { Pinecone } = require('@pinecone-database/pinecone'); // Correct import

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

// Initialize the Pinecone client
async function initializePinecone() {
    try {
      // Assuming Pinecone has an init method or setup process (customize as needed)
      console.log('Pinecone client initialized successfully');
    } catch (error) {
      console.error('Error initializing Pinecone client:', error);
    }
  }

initializePinecone();

async function createIndex(indexName, dimension) {
  try {
    await pinecone.createIndex({
      name: indexName,
      dimension: dimension,
      spec: { 
            serverless: { 
            cloud: 'aws', 
            region: 'us-east-1' 
        }
      } 
    });
    console.log(`Index "${indexName}" created successfully`);
  } catch (error) {
    console.error(`Error creating index "${indexName}":`, error);
  }
}

async function upsertVectors(indexName, vectors) {
  try {
    console.log('Vectors being upserted:', vectors);
    console.log('Is vectors an array:', Array.isArray(vectors)); // Verify it's an array
      
    const index = pinecone.Index(indexName);
    await index.upsert(
         vectors
    );
    console.log('Vectors upserted successfully');
  } catch (error) {
    console.error('Error upserting vectors:', error);
  }
}

async function queryVectors(indexName, queryVector, topK = 5) {
  try {
    const index = pinecone.Index(indexName);
    const result = await index.query({
      vector: queryVector,
      topK: topK,
      includeMetadata: true,
    });
    return result.matches;
  } catch (error) {
    console.error('Error querying vectors:', error);
    return [];
  }
}

module.exports = {
  createIndex,
  upsertVectors,
  queryVectors,
};

