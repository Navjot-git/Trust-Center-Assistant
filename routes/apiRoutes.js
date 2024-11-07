const express = require('express');
const router = express.Router();

// Route to handle user queries
router.post('/query', (req, res) => {
    try{
        const userQuery= req.body.query;
        console.log('Query:', req.body.query);
        console.log('Query:', JSON.stringify(req.body.query));

        console.log('Type of session data:', typeof req.body.query);

        if (!userQuery) {
          return res.status(400).json({ message: 'Query is required' });
        }
      
        // Store user queries in session
        if (!req.session.queries) {
          req.session.queries = [];
        }
        req.session.queries.push(userQuery);
        console.log('Type of session data:', typeof JSON.stringify(req.session.queries));

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
