// src/components/QueryInput.js
import React, { useState } from 'react';
import { queryVector } from '../api/backend';

const QueryInput = ({ setResults }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await queryVector({ queryVector: query });
        setResults(response.matches); // assuming response has matches
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your query"
            />
            <button type="submit">Search</button>
        </form>
    );
};

export default QueryInput;
