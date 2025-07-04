// ✅ src/services/preciosService.js – Versión 1.1 (04 jul 2025)
// 📦 Servicio centralizado para operaciones de precios
// ☑️ Usa api.js como los demás servicios
// 📡 Endpoints usados:
// - GET    /api/precios            → listarPreciosActivos
// - POST   /api/precios            → asignarPrecioProducto
// - GET    /api/precios/:id        → obtenerPrecioProducto

import api from "./api";

// 🔹 Obtener todos los precios activos con datos del producto
export const listarPreciosActivos = async () => {
  try {
    const res = await api.get("/precios");
    return res.data.productos; // Devuelve solo el arreglo limpio
  } catch (err) {
    console.error("❌ Error en listarPreciosActivos:", err.message);
    throw err;
  }
};

// 🔹 Asignar nuevo precio a un producto (desactiva anterior)
export const asignarPrecioProducto = async ({
  product_id,
  price,
  iva_rate,
}) => {
  try {
    const res = await api.post("/precios", {
      product_id,
      price,
      iva_rate,
    });
    return res.data; // { mensaje, precio }
  } catch (err) {
    console.error("❌ Error en asignarPrecioProducto:", err.message);
    throw err;
  }
};

// 🔹 Obtener precio activo de un solo producto
export const obtenerPrecioProducto = async (product_id) => {
  try {
    const res = await api.get(`/precios/${product_id}`);
    return res.data.precio; // { id, price, iva_rate, ... }
  } catch (err) {
    console.error("❌ Error en obtenerPrecioProducto:", err.message);
    throw err;
  }
};
