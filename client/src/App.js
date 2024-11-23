import React from 'react';
// import QueryInput from './components/QueryInput';
// import ResultsDisplay from './components/ResultsDisplay';
import SearchComponent from './components/Search';


function App() {
    // const [ setResults] = useState([]);

    return (
        <div className="App">
            <center><h1>Trust Center AI Assistant</h1></center>
            <SearchComponent />
            {/* <QueryInput setResults={setResults} /> */}
            {/* <ResultsDisplay results={results} /> */}
        </div>
    );
}

export default App;
