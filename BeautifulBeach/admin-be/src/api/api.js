import axios from "axios";
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/api",
  adapter: "xhr",
  headers: {
    "Content-Type": "application/json",
  },
});
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized - hãy đăng nhập lại");
    }
    return Promise.reject(error);
  }
);
export default api;
