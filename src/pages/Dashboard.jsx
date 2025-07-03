// ✅ src/pages/Dashboard.jsx – Versión 2.3 (02 jul 2025)
// ✅ Integrado componente <TopProductosChart /> con control de cantidad
// ✅ Conserva visualización de resumen, stock y movimientos
// ✅ Compatible con selector de mes y mantiene placeholder para gráficas futuras

import { useEffect, useState } from 'react';
import api from '@/services/api';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import ResumenVentas from '@/components/ResumenVentas'; // 📊 Componente resumen mensual
import TopProductosChart from '@/components/TopProductosChart'; // 🆕 Gráfico productos más vendidos

const Dashboard = () => {
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [userId, setUserId] = useState(null); // 🆕

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData?.user?.id) {
      setError('No se encontró el usuario en localStorage');
      setCargando(false);
      return;
    }

    const { id, first_name } = userData.user;
    setNombreUsuario(first_name || '');
    setUserId(id);

    api
      .get(`/dashboard?user_id=${id}`)
      .then((res) => {
        setResumen(res.data);
        setCargando(false);
      })
      .catch(() => {
        setError('Error al obtener el resumen');
        setCargando(false);
      });
  }, []);

  if (cargando) return <p className="text-center text-gray-500">Cargando datos...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  const totalStockCajas = resumen.inventario.reduce((acc, item) => acc + item.cajas, 0);
  const mesActual = dayjs().locale('es').format('MMMM');
  const movimientosDelMes = resumen.movimientos.filter(m => dayjs(m.fecha).isSame(dayjs(), 'month'));
  const ventasMes = movimientosDelMes.filter(m => m.tipo === 'salida').length;
  const ultEntrada = resumen.movimientos.find(m => m.tipo === 'entrada');

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 🙋‍♂️ Bienvenida */}
      <section className="text-center">
        <h1 className="text-3xl font-bold text-blue-600">
          ¡Hola {nombreUsuario || 'usuario'}! Estas son tus estadísticas de {mesActual}
        </h1>
        <p className="text-gray-600">Resumen general de tus productos y movimientos</p>
      </section>

      {/* 📊 Resumen mensual de ventas */}
      {userId && <ResumenVentas userId={userId} />}

      {/* 💡 Tarjetas resumen */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <h2 className="text-sm font-semibold text-gray-600">Total productos</h2>
          <p className="text-2xl text-blue-600 font-bold">{resumen.inventario.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <h2 className="text-sm font-semibold text-gray-600">Stock total (cajas)</h2>
          <p className="text-2xl text-indigo-600 font-bold">📦 {totalStockCajas}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <h2 className="text-sm font-semibold text-gray-600">Ventas del mes</h2>
          <p className="text-2xl text-green-600 font-bold">🛒 {ventasMes}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <h2 className="text-sm font-semibold text-gray-600">Última entrada</h2>
          <p className="text-sm text-gray-500">
            {ultEntrada ? `${ultEntrada.producto} - ${dayjs(ultEntrada.fecha).format('DD/MM/YYYY')}` : 'Sin datos aún'}
          </p>
        </div>
      </section>

      {/* 📉 Productos con bajo stock */}
      <section>
        <h2 className="text-lg font-bold text-red-600 mt-6 mb-2">🚨 Productos con bajo stock (menos de 5 cajas)</h2>
        {resumen.productos_bajo_stock.length === 0 ? (
          <p className="text-gray-500">Todos los productos tienen suficiente inventario.</p>
        ) : (
          <div className="overflow-auto rounded-md border border-gray-200 shadow-sm">
            <table className="min-w-full bg-white text-sm text-left">
              <thead className="bg-red-50 text-gray-700">
                <tr>
                  <th className="px-4 py-2">Producto</th>
                  <th className="px-4 py-2">Familia</th>
                  <th className="px-4 py-2">Cajas</th>
                </tr>
              </thead>
              <tbody>
                {resumen.productos_bajo_stock.map((item, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">{item.familia}</td>
                    <td className="px-4 py-2">{item.cajas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 📈 Gráfica: Top productos más vendidos */}
      <section>
        <h2 className="text-lg font-bold text-blue-700 mt-8 mb-2">📈 Productos más vendidos del mes</h2>
        {userId && <TopProductosChart userId={userId} />}
      </section>

      {/* 🔜 Placeholder para futuras comparativas */}
      <section>
        <h2 className="text-lg font-bold text-blue-700 mt-8 mb-2">📊 Próximamente: Comparativas por familia o meta</h2>
        <p className="text-gray-500">Estamos trabajando en una gráfica comparativa por categorías o metas mensuales.</p>
      </section>
    </main>
  );
};

export default Dashboard;
