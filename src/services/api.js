// ✅ src/services/api.js
// Configura Axios para conectarse al backend con token JWT (si existe)

// 1. Importar Axios
import axios from 'axios';

// 2. Crear instancia personalizada de Axios
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // ⚠️ Cambiar por el dominio real si se despliega
  headers: {
    'Content-Type': 'application/json'
  }
});

// 3. Interceptor: Agrega automáticamente el token JWT a cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // 🔐 JWT almacenado localmente al hacer login
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 4. Exportar para usar en todo el frontend
export default api;
