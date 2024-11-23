// src/components/ResultsDisplay.js
import React from 'react';

const ResultsDisplay = ({ results }) => {
    return (
        <div>
            {results.length ? (
                results.map((result, index) => (
                    <div key={index}>
                        <h4>{result.title}</h4>
                        <p>{result.summary}</p>
                        <small>{result.date}</small>
                    </div>
                ))
            ) : (
                <p>No results found.</p>
            )}
        </div>
    );
};

export default ResultsDisplay;
