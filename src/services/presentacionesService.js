// ✅ src/services/presentacionesService.js – Versión 1.0 (05 jul 2025)
// 📦 Servicio para consultar presentaciones activas por producto
// ☑️ Usa api.js como los demás servicios
// 📡 Endpoint usado:
// - GET /api/presentaciones/:product_id → obtenerPresentacionesPorProducto

import api from "./api";

// 🔹 Obtener presentaciones activas por producto
export const obtenerPresentacionesPorProducto = async (product_id) => {
  try {
    const res = await api.get(`/presentaciones/${product_id}`);
    return res.data.presentaciones || []; // Devuelve arreglo limpio o vacío
  } catch (error) {
    console.error("❌ Error en obtenerPresentacionesPorProducto:", error.message);
    return [];
  }
};
