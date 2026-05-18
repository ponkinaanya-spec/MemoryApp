import axios from "axios";

export const api = axios.create({
  baseURL: "https://memoryapp-production-a457.up.railway.app/api",
});