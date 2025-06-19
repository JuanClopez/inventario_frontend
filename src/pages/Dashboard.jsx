// ✅ src/pages/Dashboard.jsx
// Pantalla principal del usuario con resumen de inventario

import { useEffect, useState } from 'react';
import axios from '../services/api';

const Dashboard = () => {
  // Estado para guardar datos del backend
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Al cargar el componente, obtiene el user_id y consulta el resumen
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (!userData?.user?.id) {
      setError('No se encontró el usuario en localStorage');
      setCargando(false);
      return;
    }

    // Llama al backend con el user_id
    axios
      .get(`/dashboard?user_id=${userData.user.id}`)
      .then((response) => {
        setResumen(response.data);
        setCargando(false);
      })
      .catch((err) => {
        setError('Error al obtener el resumen');
        setCargando(false);
      });
  }, []);

  if (cargando) return <p className="text-center text-gray-600">Cargando datos...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">📊 Dashboard - Resumen de Inventario</h1>

      <table className="w-full table-auto border border-gray-300">
        <thead className="bg-blue-100">
          <tr>
            <th className="border px-4 py-2 text-left">Producto</th>
            <th className="border px-4 py-2 text-left">Familia</th>
            <th className="border px-4 py-2 text-left">Cajas</th>
            <th className="border px-4 py-2 text-left">Unidades</th>
          </tr>
        </thead>
        <tbody>
          {resumen.inventario.map((item, index) => (
            <tr key={index} className="hover:bg-gray-100">
              <td className="border px-4 py-2">{item.producto}</td>
              <td className="border px-4 py-2">{item.familia}</td>
              <td className="border px-4 py-2">{item.cajas}</td>
              <td className="border px-4 py-2">{item.unidades}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
