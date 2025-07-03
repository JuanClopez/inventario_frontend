// ✅ Ruta: src/services/axiosInstance.js
// 🔁 Instancia centralizada de Axios para llamadas al backend
// 🧩 Versión: 1.2 – 02 jul 2025
// 📦 Cambios aplicados:
// - ✅ Interceptor configurado para incluir token JWT automáticamente
// - ✅ Listo para entornos producción y desarrollo

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api", // ⛏️ Cambiar en producción
  withCredentials: true, // 🛡️ Cookies si el backend lo requiere
});

// 🧱 Interceptor para incluir token de autenticación JWT
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
