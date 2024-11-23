import { Router } from 'express';
import { exec } from 'child_process';
import OpenAI from "openai";
const router = Router();
import { createIndex, upsertVectors, queryVectors } from '../pineconeClient.mjs'; // Adjust path if needed

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
//const openaiClient = new openai.OpenAIApi(configuration);

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

router.post('/query-vectors', async (req, res) => {
  const { indexName, text, topK } = req.body;

  if (!text || !indexName) {
    return res.status(400).send('Text and indexName are required');
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const pythonScript = 'python3 generate_embedding.py';
    const process = exec(pythonScript, { maxBuffer: 1024 * 1024 });

    process.stdin.write(text);
    process.stdin.end();

    let output = '';
    process.stdout.on('data', (data) => {
      output += data;
    });

    process.stderr.on('data', (error) => {
      console.error('Error from Python script:', error);
    });

    process.on('close', async (code) => {
      if (code !== 0) {
        res.write('data: Error generating vector\n\n');
        res.end();
        return;
      }

      const queryVector = JSON.parse(output);
      const results = await queryVectors(indexName, queryVector, topK || 5);

      if (!results || results.length === 0) {
        res.write('data: No relevant matches found.\n\n');
        res.end();
        return;
      }

      const context = results.map((result, i) =>
        `Match ${i + 1}:\nTitle: ${result.metadata.title}\nSummary: ${result.metadata.summary}\n\n`
      ).join('');

      const prompt = `
        You are an AI assistant helping a user find relevant information. The user asked "${text}". Based on the search results below, provide a conversational summary.
        
        Search Results: 
        ${context}

        Response:
      `;

      const stream = await openai.chat.completions.create(
        {
          model: 'gpt-4',
          messages: [{ role: "user", content: prompt }],
          max_tokens: 300,
          temperature: 0.7,
          stream: true,
        }
      );

      console.log('OpenAI Response:', stream);
      console.log('Type of Response:', typeof stream);
      console.log('Is Response Iterable:', typeof stream[Symbol.asyncIterator] === 'function');


      if (typeof stream[Symbol.asyncIterator] !== 'function') {
        throw new Error('The response is not a readable stream.');
      }


      // if (!stream || typeof stream.on !== 'function') {
      //   throw new Error('The response is not a readable stream. Check your OpenAI SDK configuration.');
      // }
      

      for await (const chunk of stream) {
        try {
          // Each chunk is already a JavaScript object
          console.log('Raw Chunk:', chunk); // Debug the chunk content
      
          // Process the chunk
          const message = chunk; // Directly use the object
          const token = message.choices[0]?.delta?.content;
      
          if (token) {
            res.write(token); // Write the token to the SSE stream
          }
      
          // If the stream signals it's done
          if (message.done) {
            res.end();
            break;
          }
        } catch (err) {
          console.error('Error parsing stream chunk:', err);
          res.write(`data: Error parsing chunk\n\n`);
        }
      }
      res.end();
      
      // stream.on('data', (chunk) => {
      //   const lines = chunk.toString().split('\n').filter((line) => line.trim() !== '');
      //   for (const line of lines) {
      //     const message = line.replace(/^data: /, '');
      //     if (message === '[DONE]') {
      //       res.end();
      //       return;
      //     }
      //     try {
      //       const token = JSON.parse(message)?.choices[0]?.delta?.content;
      //       if (token) {
      //         res.write(`data: ${token}\n\n`);
      //       }
      //     } catch (err) {
      //       console.error('Error parsing stream chunk:', err);
      //     }
      //   }
      // });

      // stream.data.on('end', () => {
      //   res.end();
      // });

      // stream.data.on('error', (err) => {
      //   console.error('Error with streaming:', err);
      //   res.write('data: Error streaming data\n\n');
      //   res.end();
      // });
    });
  } catch (error) {
    console.error('Error querying vectors:', error);
    res.status(500).send('Failed to process request.');
  }
});

// Route to generate vector
router.post('/generate-vector', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).send('Text is required');
  }

  try {
    // Execute the Python script to generate the embedding
    const pythonScript = 'python3 generate_embedding.py';
    const process = exec(pythonScript, { maxBuffer: 1024 * 1024 });

    process.stdin.write(text);
    process.stdin.end();

    let output = '';
    process.stdout.on('data', (data) => {
      output += data;
    });

    process.stderr.on('data', (error) => {
      console.error('Error from Python script:', error);
    });

    process.on('close', (code) => {
      if (code === 0) {
        const embedding = JSON.parse(output);
        res.status(200).json({ vector: embedding });
      } else {
        res.status(500).send('Failed to generate embedding');
      }
    });

  } catch (error) {
    console.error('Error generating vector:', error);
    res.status(500).send('Internal Server Error');

  }
});

// Route to query vectors
router.post('/query-vectors_old', async (req, res) => {
  const { indexName, text, topK } = req.body;

  if (!text || !indexName) {
    return res.status(400).send('Text and indexName are required');
  }

  try {
    // Step 1: Generate embedding from text
    const pythonScript = 'python3 generate_embedding.py';
    const process = exec(pythonScript, { maxBuffer: 1024 * 1024 });

    process.stdin.write(text); // Send input text to the Python script
    process.stdin.end();

    let output = '';
    process.stdout.on('data', (data) => {
      output += data; // Capture the Python script's output
    });

    process.stderr.on('data', (error) => {
      console.error('Error from Python script:', error);
    });

    process.on('close', async (code) => {
      if (code === 0) {
        const queryVector = JSON.parse(output);
        console.log('Query vector: ', queryVector);

        // Step 2: Query Pinecone with the generated vector
        const results = await queryVectors(indexName, queryVector, topK || 5);

        if ( !results || results.length === 0){
          return res.status(404).send('No relevant matches found.')
        }

        // Step 3: Prepare context for GPT
        const context = results.map((result, i) =>
          `Match ${i + 1}:\nTitle: ${result.metadata.title}\nSummary: ${result.metadata.summary}\nSeverity: ${result.metadata.severity}\nDate: ${result.metadata.date}\n\n`
        ).join('\n');

        const prompt = `
        You are an AI assistant helping a user find relevant information. The user asked "${text}". Based on the search results below, provide a conversational summary.
        
        Seach Results: 
        ${context}

        Response:
        `;

        // Step 4: Send streaming response to GPT
        // res.setHeader('Content-Type', 'text/event-stream');
        // res.setHeader('Cache-Control', 'no-cache');
        // res.setHeader('Connection', 'keep-alive');

        const gptResponse = await openai.chat.completions.create(
          {
            model: 'gpt-4',
            messages: [{ role: "user", content: prompt }],
            max_tokens: 500,
            temperature: 0.7,
    
          });
        
        const responseText= gptResponse.choices[0].message.content.trim();
        
        // Step 5: Return GPT-generated response
        res.status(200).json({ response: responseText });

      } else {
        res.status(500).send('Failed to generate vector');
      }
    });
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

export default router;
