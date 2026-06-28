import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configura l'interceptor per iniettare il token JWT di Clerk in modo dinamico
export const setupInterceptors = (getToken) => {
  api.interceptors.request.use(
    async (config) => {
      try {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Errore durante il recupero del token Clerk:', error);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

export default api;
