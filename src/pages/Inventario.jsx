// ✅ src/pages/Inventario.jsx – Versión 1.2 (30 jun 2025)
// 📦 Vista de Inventario actual del usuario (derivada de /dashboard)
// ✅ Tabla centrada visualmente: Familia → Producto → Cajas → Unidades
// ✅ Botón de exportación a CSV funcional
// 🔐 Protegido por token, usa localStorage para extraer user_id

import { useEffect, useState } from 'react';
import api from '@/services/api';

const Inventario = () => {
  const [inventario, setInventario] = useState([]);
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
        setInventario(res.data.inventario || []);
        setCargando(false);
      })
      .catch(() => {
        setError('Error al cargar inventario');
        setCargando(false);
      });
  }, []);

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-700">📦 Inventario Actual</h1>
        <a
          href="http://localhost:3000/api/exportar/inventario"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-base"
        >
          📤 Exportar CSV
        </a>
      </div>

      {cargando ? (
        <p className="text-gray-500">Cargando inventario...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <section>
          <div className="overflow-auto rounded-md border border-gray-200 shadow-sm">
            <table className="min-w-full bg-white text-sm text-center">
              <thead className="bg-blue-700 text-white">
                <tr>
                  <th className="px-4 py-2 font-semibold">Familia</th>
                  <th className="px-4 py-2 font-semibold">Producto</th>
                  <th className="px-4 py-2 font-semibold">Cajas</th>
                  <th className="px-4 py-2 font-semibold">Unidades</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {inventario.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{item.familia}</td>
                    <td className="px-4 py-2">{item.producto}</td>
                    <td className="px-4 py-2">{item.cajas}</td>
                    <td className="px-4 py-2">{item.unidades}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
};

export default Inventario;
