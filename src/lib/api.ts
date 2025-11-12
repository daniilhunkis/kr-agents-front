import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
});

export const createObject = (data: FormData) =>
  api.post("/objects", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export default api;
