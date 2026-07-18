import axios from 'axios';

// Create a reusable Axios instance configured for our MERN backend
const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true, // Crucial for sending/receiving HttpOnly cookies (JWT session token)
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
