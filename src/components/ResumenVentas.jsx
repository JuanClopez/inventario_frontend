// ✅ src/components/ResumenVentas.jsx – Versión 1.0 (01 jul 2025)
// 📊 Componente que muestra el resumen mensual de ventas del usuario
// - Muestra subtotal, descuento, IVA, total neto, meta mensual y porcentaje de avance
// - Permite cambiar el mes de análisis

import { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const ResumenVentas = ({ userId }) => {
  const [mes, setMes] = useState(dayjs().format('YYYY-MM'));
  const [loading, setLoading] = useState(false);
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState(null);

  const cargarResumen = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get('/api/ventas/resumen', {
        params: {
          user_id: userId,
          month: mes + '-01', // formato requerido: yyyy-mm-01
        },
      });
      setResumen(data);
    } catch (err) {
      console.error('Error al cargar resumen:', err);
      setError('No se pudo cargar el resumen');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) cargarResumen();
  }, [userId, mes]);

  const handleMesChange = (e) => {
    setMes(e.target.value);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-700">Resumen de Ventas</h2>
        <input
          type="month"
          value={mes}
          onChange={handleMesChange}
          className="border rounded-md px-2 py-1 text-sm text-gray-600"
        />
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Cargando resumen...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : resumen ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
            <p className="text-xs text-blue-500">Subtotal</p>
            <p className="text-lg font-bold">${Number(resumen.resumen?.net_total + resumen.resumen?.discounts - resumen.resumen?.iva_total).toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
            <p className="text-xs text-blue-500">Descuento total</p>
            <p className="text-lg font-bold text-red-600">-${Number(resumen.resumen?.discounts).toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
            <p className="text-xs text-blue-500">IVA total</p>
            <p className="text-lg font-bold text-yellow-600">+${Number(resumen.resumen?.iva_total).toLocaleString()}</p>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg shadow-sm">
            <p className="text-xs text-blue-500">Total neto</p>
            <p className="text-lg font-bold text-green-700">${Number(resumen.resumen?.net_total).toLocaleString()}</p>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg shadow-sm">
            <p className="text-xs text-blue-500">Meta mensual</p>
            <p className="text-lg font-bold">${Number(resumen.goal_amount).toLocaleString()}</p>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg shadow-sm">
            <p className="text-xs text-blue-500">% Avance</p>
            <p className="text-lg font-bold">
              {resumen.porcentaje_avance}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Sin datos disponibles para el mes seleccionado.</p>
      )}
    </div>
  );
};

export default ResumenVentas;
