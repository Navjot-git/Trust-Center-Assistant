import fs from 'fs';
import csv from 'csv-parser';
import { upsertVectors, upsertVectorsInBatches } from './pineconeClient.mjs';

const indexName = 'my-index';
const vectors = [];

// Read the CSV file and prepare data for Pinecone
fs.createReadStream('processed_data.csv')
.pipe(csv())
.on('data', (row) => {
    const vector = {
    id: `vec-${vectors.length}`,
    values: JSON.parse(row.embeddings_128), // Convert stringified embedding to array
    metadata: {
        title: row.Title,
        summary: row.Summary,
        date: row.Date,
        severity: row.Severity,
        link: row.Link,
    },
    };
    vectors.push(vector);
})
.on('end', async () => {
    console.log('Data loaded from CSV, now upserting to Pinecone');
    await upsertVectorsInBatches(indexName, vectors);
    console.log('Data successfully upserted to Pinecone');
});

