import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api", // backend base URL
});

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mm_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
