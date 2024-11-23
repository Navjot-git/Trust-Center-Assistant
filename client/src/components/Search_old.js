import React, { useState } from 'react';
import axios from 'axios';
import '../SearchComponent.css';


const SearchComponent = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    try {
      console.log(query);
      const result = await axios.post('http://localhost:5001/api/query-vectors', {
        indexName: 'my-index', // Replace with your actual index name
        text: query,    // Backend should handle converting query to vector
        topK: 15                // Replace with desired number of results
      });

      setResults(result.data.response);
    } catch (error) {
      console.error('Error querying vectors:', error);
      setError('Failed to query vectors');
    }
  };

  return (
    
    <div class='container'>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type your search here"
      />
      <button onClick={handleSearch}>Search</button>

      {error && <p class='error' style={{ color: 'red' }}>{error}</p>}

      {results && (
        <div class='response'>
          <h3>Response:</h3>
          <p>{results}</p>
        </div>
      )}

      {/* {error && <p>{error}</p>}

      <ul>
        {results.map((result, index) => (
          <li key={index}>{JSON.stringify(result)}</li>
        ))}
      </ul> */}
    </div>
  );
};


export default SearchComponent;
