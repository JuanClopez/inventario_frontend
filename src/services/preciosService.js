// ✅ src/services/preciosService.js – Versión 1.3 (06 jul 2025)
// 📦 Servicio centralizado para operaciones de precios
// 🧩 Ahora devuelve objeto completo: { productos, total, etc }
// ☑️ Usa api.js como los demás servicios

import api from "./api";

// 🔹 Obtener todos los precios activos con datos del producto
export const listarPreciosActivos = async () => {
  try {
    const res = await api.get("/precios");
    return res.data; // Retorna objeto completo, no solo productos
  } catch (err) {
    console.error("❌ Error en listarPreciosActivos:", err.message);
    throw err;
  }
};

// 🔹 Asignar nuevo precio a producto o presentación
export const asignarPrecioProducto = async ({
  product_id,
  presentation_id,
  price,
  iva_rate,
}) => {
  try {
    const payload = {
      price,
      iva_rate,
    };

    if (presentation_id) {
      payload.presentation_id = presentation_id;
    } else if (product_id) {
      payload.product_id = product_id;
    }

    const res = await api.post("/precios", payload);
    return res.data;
  } catch (err) {
    console.error("❌ Error en asignarPrecioProducto:", err.message);
    throw err;
  }
};

// 🔹 Obtener precio activo de un solo producto
export const obtenerPrecioProducto = async (product_id) => {
  try {
    const res = await api.get(`/precios/${product_id}`);
    return res.data.precio;
  } catch (err) {
    console.error("❌ Error en obtenerPrecioProducto:", err.message);
    throw err;
  }
};
