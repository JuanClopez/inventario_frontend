// ✅ src/pages/Movimientos.jsx – Versión 1.4 (27 jun 2025)
// Ajustado para trabajar 100% con backend seguro: no se envía user_id desde frontend

// ... (importaciones sin cambios)
import { useEffect, useState } from 'react';
import api from '@/services/api';

const Movimientos = () => {
  // ... (estados sin cambios)

  // 📊 Estados para filtros y movimientos
  const [movimientos, setMovimientos] = useState([]);
  const [filtroDesde, setFiltroDesde] = useState('');
  const [filtroHasta, setFiltroHasta] = useState('');
  const [filtroProducto, setFiltroProducto] = useState('');

  // 🧠 Cargar movimientos con filtros (sin enviar user_id)
  const cargarMovimientos = async () => {
    try {
      const params = new URLSearchParams();
      if (filtroDesde) params.append('desde', filtroDesde);
      if (filtroHasta) params.append('hasta', filtroHasta);
      if (filtroProducto) params.append('producto', filtroProducto);

      const { data } = await api.get(`/movimientos?${params.toString()}`);
      setMovimientos(data);
    } catch (error) {
      console.error('❌ Error cargando movimientos:', error.message);
    }
  };

  useEffect(() => {
    cargarMovimientos();
  }, []);

  // ✅ Registrar movimiento sin enviar user_id
  const handleRegistrar = async () => {
    if (!producto || !familia || !cantidad || cantidad <= 0) {
      alert('⚠️ Faltan datos o cantidad inválida');
      return;
    }

    try {
      const body = {
        type: tipo,
        product_id: producto,
        quantity_boxes: cantidad,
        quantity_units: usarUnidades ? cantidadUnidades : 0,
        description: descripcion.trim()
      };

      await api.post('/movimientos', body);

      // ✅ Actualizar tabla y limpiar formulario
      await cargarMovimientos();
      setFamilia('');
      setProducto('');
      setCantidad(1);
      setCantidadUnidades(0);
      setUsarUnidades(false);
      setDescripcion('');
    } catch (error) {
      console.error('❌ Error al registrar movimiento:', error);
      if (error.response?.data?.mensaje) {
        alert(`❌ ${error.response.data.mensaje}`);
      } else {
        alert('❌ Error desconocido al registrar el movimiento');
      }
    }
  };

  // ... (JSX sin cambios significativos)
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Registrar movimiento</h1>
      {/* ... resto sin cambios ... */}
    </div>
  );
};

export default Movimientos;
