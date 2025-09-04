import axios from "axios";

const client = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
