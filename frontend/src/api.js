import axios from 'axios';

// In development, frontend (5173) calls backend (8000)
// In production (Docker), frontend (nginx) calls backend at /api or full URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
