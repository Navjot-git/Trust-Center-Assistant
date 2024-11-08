const express = require('express');
const router = express.Router();
const { createIndex, upsertVectors, queryVectors } = require('../pineconeClient'); // Adjust path if needed

// Route to create an index
router.post('/create-index', async (req, res) => {
  const { indexName, dimension } = req.body;
  try {
    await createIndex(indexName, dimension);
    res.status(200).send(`Index "${indexName}" creation initiated`);
  } catch (error) {
    console.error('Error creating index:', error);
    res.status(500).send('Failed to create index');
  }
});

// Route to upsert vectors
router.post('/upsert-vectors', async (req, res) => {
  const { indexName, vectors } = req.body;
  try {
    if (!indexName || !Array.isArray(vectors)) {
      return res.status(400).json({ error: 'Invalid payload structure' });
    }
    await upsertVectors(indexName, vectors);
    res.status(200).json({ message: 'Vectors upserted successfully' });
  } catch (error) {
    console.error('Error upserting vectors:', error);
    res.status(500).send('Failed to upsert vectors');
  }
});

// Route to query vectors
router.post('/query-vectors', async (req, res) => {
  const { indexName, queryVector, topK } = req.body;
  try {
    const results = await queryVectors(indexName, queryVector, topK);
    res.status(200).json({ matches: results });
  } catch (error) {
    console.error('Error querying vectors:', error);
    res.status(500).send('Failed to query vectors');
  }
});


// Route to handle user queries
router.post('/query', (req, res) => {
    try{
        const userQuery= req.body.query;

        if (!userQuery) {
          return res.status(400).json({ message: 'Query is required' });
        }
      
        // Store user queries in session
        if (!req.session.queries) {
          req.session.queries = [];
        }
        req.session.queries.push(userQuery);

        // Placeholder logic for processing the query
        console.log(`Session Queries: ${req.session.queries}`);
        res.json({ response: `Processed query: ${userQuery}` });
    } catch (error) {
        console.error('Error processing query:', error);
        next(error); // Pass the error to Express's error-handling middleware
    }
  
});

// Route to handle document retrieval
router.get('/documents/:id', (req, res) => {
  const documentId = req.params.id;
  // Placeholder logic to retrieve a document by ID
  console.log(`Retrieving document with ID: ${documentId}`);
  res.json({ documentId, content: 'Sample document content' });
});

module.exports = router;
