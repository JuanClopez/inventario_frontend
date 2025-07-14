// ✅ Ruta: src/components/TopProductosChart.jsx
// 📊 Componente: TopProductosChart
// 📦 Versión: 1.6 – 12 jul 2025
// 🛠️ Cambios aplicados:
// - ✅ Ahora acepta `productos` como prop para reutilización en Dashboard
// - ✅ Conserva fallback a llamada propia si no recibe props
// - ✅ Alineado con backend modular y resumen maestro v2.7
// - ✅ Mejor control de errores y consistencia visual

import { useEffect, useState } from 'react';
import axiosInstance from '@/services/axiosInstance';
import dayjs from 'dayjs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

const TopProductosChart = ({ productos = null }) => {
  const [topProductos, setTopProductos] = useState([]);
  const [cantidadVisible, setCantidadVisible] = useState(5);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔁 Cargar desde backend si no recibe props
  const cargarTopProductos = async () => {
    setLoading(true);
    setError(null);

    const fecha_inicio = dayjs().startOf('month').format('YYYY-MM-DD');
    const fecha_fin = dayjs().endOf('month').format('YYYY-MM-DD');

    try {
      const { data } = await axiosInstance.get('/ventas/top-productos', {
        params: { fecha_inicio, fecha_fin },
      });

      if (Array.isArray(data.top_productos)) {
        setTopProductos(data.top_productos);
      } else {
        console.error('Respuesta inesperada:', data);
        setError('Respuesta del servidor inválida');
        setTopProductos([]);
      }
    } catch (err) {
      console.error('Error al cargar top productos:', err);
      if (err.response?.status === 401) {
        setError('⚠️ Sesión expirada. Vuelve a iniciar sesión.');
      } else {
        setError('❌ No se pudo cargar el ranking de productos');
      }
      setTopProductos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Solo carga desde backend si no se pasa por props
    if (!productos) {
      cargarTopProductos();
    } else {
      setTopProductos(productos);
    }
  }, [productos]);

  const productosFiltrados = topProductos.slice(0, cantidadVisible);

  return (
    <div className="bg-white rounded-xl shadow-md p-5 mt-6">
      {/* 🔹 Encabezado y control */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-blue-700">
          🥇 Top productos más vendidos
        </h2>
        <select
          value={cantidadVisible}
          onChange={(e) => setCantidadVisible(Number(e.target.value))}
          className="border rounded px-2 py-1 text-sm text-gray-700"
        >
          {[3, 5, 7, 10].map((num) => (
            <option key={num} value={num}>
              Top {num}
            </option>
          ))}
        </select>
      </div>

      {/* 🔸 Estados visuales */}
      {loading ? (
        <p className="text-sm text-gray-500">Cargando datos...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : productosFiltrados.length === 0 ? (
        <p className="text-sm text-gray-500">
          No hay productos vendidos este mes aún.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={productosFiltrados}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="producto" width={160} />
            <Tooltip formatter={(value) => `${value} cajas`} />
            <Legend />
            <Bar dataKey="total_cajas" name="Cajas vendidas" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TopProductosChart;
