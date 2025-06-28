// ✅ src/pages/Movimientos.jsx – Versión 1.7 (27 jun 2025)
// 🔧 Carga funcional de familias y productos, filtrado correcto, backend seguro y tabla de movimientos consolidada

import { useEffect, useState } from 'react';
import api from '@/services/api';

const Movimientos = () => {
  // 🧠 Estados del formulario
  const [tipo, setTipo] = useState('salida');
  const [familia, setFamilia] = useState('');
  const [producto, setProducto] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [usarUnidades, setUsarUnidades] = useState(false);
  const [cantidadUnidades, setCantidadUnidades] = useState(0);
  const [descripcion, setDescripcion] = useState('');

  // 📚 Catálogos
  const [familias, setFamilias] = useState([]);
  const [productosFull, setProductosFull] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);

  // 📊 Filtros y movimientos
  const [movimientos, setMovimientos] = useState([]);
  const [filtroDesde, setFiltroDesde] = useState('');
  const [filtroHasta, setFiltroHasta] = useState('');
  const [filtroProducto, setFiltroProducto] = useState('');

  // 🔄 Cargar familias y productos
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [resFamilias, resProductos] = await Promise.all([
          api.get('/familias'),
          api.get('/productos')
        ]);
        setFamilias(resFamilias.data);
        setProductosFull(resProductos.data);
      } catch (error) {
        console.error('❌ Error cargando catálogos:', error);
      }
    };
    cargarCatalogos();
  }, []);

  // 🎯 Filtrar productos al seleccionar una familia
  useEffect(() => {
    if (!familia) {
      setProductosFiltrados([]);
      return;
    }
    const filtrados = productosFull.filter(p => p.familia === familia);
    setProductosFiltrados(filtrados);
    setProducto('');
  }, [familia, productosFull]);

  // 📥 Cargar movimientos
  const cargarMovimientos = async () => {
    try {
      const params = new URLSearchParams();
      if (filtroDesde) params.append('desde', filtroDesde);
      if (filtroHasta) params.append('hasta', filtroHasta);
      if (filtroProducto) params.append('producto', filtroProducto);
      const { data } = await api.get(`/movimientos?${params.toString()}`);
      setMovimientos(data);
    } catch (error) {
      console.error('❌ Error al cargar movimientos:', error);
    }
  };

  useEffect(() => {
    cargarMovimientos();
  }, []);

  // ✅ Registro de movimiento
  const handleRegistrar = async () => {
    if (!producto || !familia || !cantidad || cantidad <= 0) {
      alert('⚠️ Datos incompletos o cantidad inválida');
      return;
    }

    try {
      await api.post('/movimientos', {
        type: tipo,
        product_id: producto,
        quantity_boxes: cantidad,
        quantity_units: usarUnidades ? cantidadUnidades : 0,
        description: descripcion.trim()
      });
      await cargarMovimientos();
      setFamilia('');
      setProducto('');
      setCantidad(1);
      setCantidadUnidades(0);
      setUsarUnidades(false);
      setDescripcion('');
    } catch (error) {
      alert(error.response?.data?.mensaje || '❌ Error desconocido al registrar');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Registrar movimiento</h1>

      {/* 🔘 Tipo */}
      <div className="mb-4">
        <label className="mr-4">
          <input type="radio" value="salida" checked={tipo === 'salida'} onChange={() => setTipo('salida')} className="mr-1" />
          Salida
        </label>
        <label>
          <input type="radio" value="entrada" checked={tipo === 'entrada'} onChange={() => setTipo('entrada')} className="mr-1" />
          Entrada
        </label>
      </div>

      {/* 🧬 Familia */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Familia</label>
        <select value={familia} onChange={(e) => setFamilia(e.target.value)} className="w-full border rounded px-3 py-2">
          <option value="">Selecciona una familia</option>
          {familias.map((f) => (
            <option key={f.id} value={f.name}>{f.name}</option>
          ))}
        </select>
      </div>

      {/* 📦 Producto */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Producto</label>
        <select value={producto} onChange={(e) => setProducto(e.target.value)} disabled={!familia} className="w-full border rounded px-3 py-2">
          <option value="">Selecciona un producto</option>
          {productosFiltrados.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* 🔢 Cantidad cajas */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Cantidad (cajas)</label>
        <input type="number" min="1" value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
      </div>

      {/* 🎯 Unidades opcionales */}
      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={usarUnidades} onChange={() => setUsarUnidades(!usarUnidades)} />
          <span>¿Registrar unidades sueltas?</span>
        </label>
        {usarUnidades && (
          <input type="number" min="0" value={cantidadUnidades} onChange={(e) => setCantidadUnidades(Number(e.target.value))} className="mt-2 w-full border rounded px-3 py-2" />
        )}
      </div>

      {/* 📝 Descripción */}
      <div className="mb-6">
        <label className="block mb-1 font-medium">Descripción</label>
        <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows="3" className="w-full border rounded px-3 py-2" placeholder="Ej: Envío a sede norte..." />
      </div>

      <button onClick={handleRegistrar} className="btn-base">Registrar movimiento</button>

      {/* 📊 Historial de movimientos */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-blue-700 mb-4">Movimientos recientes</h2>

        {/* 🔎 Filtros */}
        <div className="flex flex-wrap gap-4 mb-4">
          <input type="date" value={filtroDesde} onChange={(e) => setFiltroDesde(e.target.value)} className="border rounded px-2 py-1" />
          <input type="date" value={filtroHasta} onChange={(e) => setFiltroHasta(e.target.value)} className="border rounded px-2 py-1" />
          <input type="text" placeholder="Buscar producto..." value={filtroProducto} onChange={(e) => setFiltroProducto(e.target.value)} className="border rounded px-2 py-1" />
          <button onClick={cargarMovimientos} className="btn-base">Aplicar filtros</button>
        </div>

        {/* 🧾 Tabla */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="text-left px-4 py-2">Fecha</th>
                <th className="text-left px-4 py-2">Tipo</th>
                <th className="text-left px-4 py-2">Familia</th>
                <th className="text-left px-4 py-2">Producto</th>
                <th className="text-left px-4 py-2">Cajas</th>
                <th className="text-left px-4 py-2">Unidades</th>
                <th className="text-left px-4 py-2">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id} className="border-t text-sm">
                  <td className="px-4 py-2">{new Date(m.fecha).toLocaleString()}</td>
                  <td className="px-4 py-2 capitalize">{m.tipo}</td>
                  <td className="px-4 py-2">{m.familia}</td>
                  <td className="px-4 py-2">{m.producto}</td>
                  <td className="px-4 py-2">{m.cajas}</td>
                  <td className="px-4 py-2">{m.unidades}</td>
                  <td className="px-4 py-2">{m.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Movimientos;
