import axios from "axios";

const client = axios.create({
  baseURL: "https://noteify-3c3u.onrender.com",
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
