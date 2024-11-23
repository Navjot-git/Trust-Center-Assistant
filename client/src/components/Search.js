import React, { useState } from 'react';
import '../SearchComponent.css';

const SearchComponent = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSearch = async () => {
    setResponse(''); // Clear previous responses
    setError(null); // Clear any errors
    setIsStreaming(true); // Mark streaming as active

    if (!query) {
      setError('Please enter a query.');
      setIsStreaming(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5001/api/query-vectors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: query,
          indexName: 'my-index', // Replace with your actual index name
          topK: 15, // Number of results
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let streamedResponse = '';

      // Read the stream
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        streamedResponse += chunk;
        setResponse((prev) => prev + chunk); // Append to response
      }

      setIsStreaming(false); // Streaming completed
    } catch (err) {
      console.error('Streaming error:', err);
      setError('An error occurred while streaming the response.');
      setIsStreaming(false);
    }
  };

  return (
    <div className="container">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type your search here"
      />
      <button onClick={handleSearch} disabled={isStreaming}>
        {isStreaming ? 'Streaming...' : 'Search'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="response">
        <h3>Response:</h3>
        <p style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{response}</p>
      </div>
    </div>
  );
};

export default SearchComponent;
