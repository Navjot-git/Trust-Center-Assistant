import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api'; // Adjust the backend port if needed

export const upsertVector = async (vectorData) => {
    const response = await axios.post(`${API_BASE_URL}/upsert-vectors`, vectorData);
    return response.data;
};

export const queryVector = async (queryData) => {
    const response = await axios.post(`${API_BASE_URL}/query-vectors`, queryData);
    return response.data;
};

// Add more backend API calls as needed
