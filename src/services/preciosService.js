// ✅ src/services/preciosService.js – Versión 1.5 (06 jul 2025)
// 🔧 Eliminado uso de product_id completamente
// 🧩 100% alineado con backend v2.6 y frontend actualizado
// 📦 Centralizado con api.js

import api from "./api";

// 🔹 Obtener todos los precios activos (incluye datos del producto y presentación)
export const listarPreciosActivos = async () => {
  try {
    const res = await api.get("/precios");
    return res.data; // { productos: [...] }
  } catch (err) {
    console.error("❌ Error en listarPreciosActivos:", err.message);
    throw err;
  }
};

// 🔹 Asignar nuevo precio a una presentación
export const asignarPrecioProducto = async ({
  presentation_id,
  price,
  iva_rate,
}) => {
  try {
    const payload = {
      presentation_id,
      price,
      iva_rate,
    };

    const res = await api.post("/precios", payload);
    return res.data;
  } catch (err) {
    console.error("❌ Error en asignarPrecioProducto:", err.message);
    throw err;
  }
};

// 🔹 Obtener precio activo de una presentación
export const obtenerPrecioProducto = async (presentation_id) => {
  try {
    const res = await api.get(`/precios/${presentation_id}`);
    return res.data.precio;
  } catch (err) {
    console.error("❌ Error en obtenerPrecioProducto:", err.message);
    throw err;
  }
};
