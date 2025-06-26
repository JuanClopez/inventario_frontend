// ✅ src/pages/Dashboard.jsx – Vista principal con resumen visual e inventario

import { useEffect, useState } from 'react';
import api from '@/services/api';

const Dashboard = () => {
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (!userData?.user?.id) {
      setError('No se encontró el usuario en localStorage');
      setCargando(false);
      return;
    }

    api
      .get(`/dashboard?user_id=${userData.user.id}`)
      .then((res) => {
        setResumen(res.data);
        setCargando(false);
      })
      .catch(() => {
        setError('Error al obtener el resumen');
        setCargando(false);
      });
  }, []);

  if (cargando) {
    return <p className="text-center text-gray-500">Cargando datos...</p>;
  }

  if (error) {
    return <p className="text-center text-red-600">{error}</p>;
  }

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-6">
      {/* 🎉 Bienvenida y usuario */}
      <section className="text-center">
        <h1 className="text-3xl font-bold text-blue-600">Bienvenido al Inventario</h1>
        <p className="text-gray-600">Resumen general de tus productos y movimientos</p>
      </section>

      {/* 📊 Tarjetas resumen */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <h2 className="text-lg font-semibold text-gray-600">Total productos</h2>
          <p className="text-2xl text-blue-600 font-bold">
            {resumen.inventario.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <h2 className="text-lg font-semibold text-gray-600">Ventas del mes</h2>
          <p className="text-2xl text-green-600 font-bold">📦 0</p>
          {/* Puedes conectar esto a otra ruta del backend más adelante */}
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <h2 className="text-lg font-semibold text-gray-600">Movimientos</h2>
          <p className="text-2xl text-orange-500 font-bold">↕️ 0</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <h2 className="text-lg font-semibold text-gray-600">Última entrada</h2>
          <p className="text-sm text-gray-500">Sin datos aún</p>
        </div>
      </section>

      {/* 🧭 Acciones rápidas */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <button className="btn-base w-full">➕ Registrar Entrada</button>
        <button className="btn-base w-full">➖ Registrar Salida</button>
        <button className="btn-base w-full">📦 Ver Inventario</button>
        <button className="btn-base w-full">📊 Ver Movimientos</button>
      </section>

      {/* 📋 Tabla de resumen */}
      <section>
        <h2 className="text-xl font-semibold text-blue-700 mb-2">🗂 Inventario actual</h2>
        <div className="overflow-auto rounded-md border border-gray-200 shadow-sm">
          <table className="min-w-full bg-white text-sm text-left">
            <thead className="bg-blue-50 text-gray-700">
              <tr>
                <th className="px-4 py-2">Producto</th>
                <th className="px-4 py-2">Familia</th>
                <th className="px-4 py-2">Cajas</th>
                <th className="px-4 py-2">Unidades</th>
              </tr>
            </thead>
            <tbody>
              {resumen.inventario.map((item, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{item.producto}</td>
                  <td className="px-4 py-2">{item.familia}</td>
                  <td className="px-4 py-2">{item.cajas}</td>
                  <td className="px-4 py-2">{item.unidades}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
