// ✅ Ruta: src/components/ResumenVentas.jsx
// 📊 Componente que muestra el resumen mensual de ventas del usuario
// 🧩 Versión: 1.3 – 12 jul 2025
// 📦 Cambios aplicados:
// - ✅ Alineado a nueva estructura de backend `/dashboard` con `resumen_ventas` embebido
// - ✅ Elimina llamada redundante a /ventas/resumen
// - ✅ Componente ahora acepta prop `resumenVentas` (más reutilizable)
// - ✅ Compatible con Resumen Maestro v2.7 – modular, tolerante, sin duplicar lógica

import dayjs from "dayjs";

const ResumenVentas = ({ resumenVentas = null }) => {
  const mesActual = dayjs().format("YYYY-MM");

  // 🧪 Validación de datos de entrada
  const resumen = {
    neto: Number(resumenVentas?.neto) || 0,
    descuento: Number(resumenVentas?.descuento) || 0,
    iva: Number(resumenVentas?.iva) || 0,
    meta: Number(resumenVentas?.meta) || 0,
    porcentaje_cumplimiento: Number(resumenVentas?.porcentaje_cumplimiento) || 0,
  };

  const hayDatos = resumenVentas !== null;

  return (
    <div className="bg-white rounded-xl shadow-md p-5 mt-6">
      {/* 🔹 Encabezado */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-700">Resumen de Ventas</h2>
        <input
          type="month"
          value={mesActual}
          readOnly
          className="border rounded-md px-2 py-1 text-sm text-gray-600 bg-gray-100 cursor-not-allowed"
        />
      </div>

      {/* 🔹 Contenido o estado vacío */}
      {!hayDatos ? (
        <p className="text-sm text-gray-500">Sin datos disponibles para el mes actual.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
            <p className="text-xs text-blue-500">Subtotal</p>
            <p className="text-lg font-bold">
              ${Number(resumen.neto + resumen.descuento - resumen.iva).toLocaleString()}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
            <p className="text-xs text-blue-500">Descuento total</p>
            <p className="text-lg font-bold text-red-600">
              -${resumen.descuento.toLocaleString()}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
            <p className="text-xs text-blue-500">IVA total</p>
            <p className="text-lg font-bold text-yellow-600">
              +${resumen.iva.toLocaleString()}
            </p>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg shadow-sm">
            <p className="text-xs text-blue-500">Total neto</p>
            <p className="text-lg font-bold text-green-700">
              ${resumen.neto.toLocaleString()}
            </p>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg shadow-sm">
            <p className="text-xs text-blue-500">Meta mensual</p>
            <p className="text-lg font-bold">
              ${resumen.meta.toLocaleString()}
            </p>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg shadow-sm">
            <p className="text-xs text-blue-500">% Avance</p>
            <p className="text-lg font-bold">{resumen.porcentaje_cumplimiento}%</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumenVentas;
