import axios from 'axios';
const API = axios.create({
  // Temporarily changed for local demo recording (macOS port 5000 issue)
  baseURL: 'http://localhost:5001/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default API;
