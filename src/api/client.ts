import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${import.meta.env.VITE_BASE_API_TOKEN}`,
  },
});

// Simulate network latency globally (1s) for all responses (success and error) just to show loading states
apiClient.interceptors.response.use(
  async (response) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return response;
  },
  async (error) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return Promise.reject(error);
  },
);
