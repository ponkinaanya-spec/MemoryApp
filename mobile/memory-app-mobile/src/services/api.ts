import axios from "axios";

export const api = axios.create({
  baseURL: "https://logos-page-palestinian-entire.trycloudflare.com/api"
});