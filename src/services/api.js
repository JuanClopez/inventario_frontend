// ✅ src/services/api.js – Configuración central de Axios (Versión 1.1 – 27 jun 2025)

import axios from 'axios';

// 🛠 Crear instancia personalizada con baseURL del backend
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // ⚠️ Cambiar por el dominio real si se despliega
  headers: {
    'Content-Type': 'application/json', // ✅ Asegura que las peticiones sean interpretadas como JSON
  },
});

// 🛡 Interceptor para añadir token JWT si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // 🔐 Leer token del almacenamiento local
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // ✅ Inyectar el token en cada petición
    }
    return config;
  },
  (error) => {
    return Promise.reject(error); // ⚠️ Si falla el interceptor, propaga el error
  }
);

export default api;
