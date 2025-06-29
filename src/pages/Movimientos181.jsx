// ✅ src/pages/Movimientos.jsx – Versión 1.8.1 (Reparación visual + stock dinámico)
// 🔧 Muestra el stock disponible al seleccionar producto
// 🔒 Desactiva el botón de registrar si la cantidad excede el stock en salidas
// ✅ Carga de familias y productos intacta
// ⛔️ No se altera la lógica de entradas
// 🛠 Restaura tabla de movimientos, muestra stock actual y corrige advertencias

import { useEffect, useState } from 'react';
import api from '@/services/api';

const Movimientos = () => {
  const [tipo, setTipo] = useState('salida');
  const [familia, setFamilia] = useState('');
  const [producto, setProducto] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [usarUnidades, setUsarUnidades] = useState(false);
  const [cantidadUnidades, setCantidadUnidades] = useState(0);
  const [descripcion, setDescripcion] = useState('');

  const [familias, setFamilias] = useState([]);
  const [productosFull, setProductosFull] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);

  const [movimientos, setMovimientos] = useState([]);
  const [filtroDesde, setFiltroDesde] = useState('');
  const [filtroHasta, setFiltroHasta] = useState('');
  const [filtroProducto, setFiltroProducto] = useState('');

  const [stockDisponible, setStockDisponible] = useState(null);
  const [cargandoStock, setCargandoStock] = useState(false);

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

  useEffect(() => {
    if (!familia) {
      setProductosFiltrados([]);
      return;
    }
    const filtrados = productosFull.filter(p => p.familia === familia);
    setProductosFiltrados(filtrados);
    setProducto('');
    setStockDisponible(null);
  }, [familia, productosFull]);

  useEffect(() => {
    const cargarStock = async () => {
      if (!producto) {
        setStockDisponible(null);
        return;
      }
      try {
        setCargandoStock(true);
        const { data } = await api.get(`/inventario?producto_id=${producto}`);
        setStockDisponible(data);
      } catch (err) {
        setStockDisponible(null);
      } finally {
        setCargandoStock(false);
      }
    };
    cargarStock();
  }, [producto]);

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

  const handleRegistrar = async () => {
    if (!producto || !familia || !cantidad || cantidad <= 0) {
      alert('⚠️ Datos incompletos o cantidad inválida');
      return;
    }

    if (tipo === 'salida' && stockDisponible) {
      if (cantidad > stockDisponible.cajas || cantidadUnidades > stockDisponible.unidades) {
        alert('❌ Stock insuficiente para registrar esta salida.');
        return;
      }
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
      setStockDisponible(null);
    } catch (error) {
      alert(error.response?.data?.mensaje || '❌ Error desconocido al registrar');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Registrar movimiento</h1>

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

      <div className="mb-4">
        <label className="block mb-1 font-medium">Familia</label>
        <select value={familia} onChange={(e) => setFamilia(e.target.value)} className="w-full border rounded px-3 py-2">
          <option value="">Selecciona una familia</option>
          {familias.map((f) => (
            <option key={f.id} value={f.name}>{f.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Producto</label>
        <select value={producto} onChange={(e) => setProducto(e.target.value)} disabled={!familia} className="w-full border rounded px-3 py-2">
          <option value="">Selecciona un producto</option>
          {productosFiltrados.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {producto && stockDisponible && (
          <p className="text-sm text-gray-500 mt-1">Stock actual: {stockDisponible.cajas} cajas, {stockDisponible.unidades} unidades</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Cantidad (cajas)</label>
        <input type="number" min="1" value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
      </div>

      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={usarUnidades} onChange={() => setUsarUnidades(!usarUnidades)} />
          <span>¿Registrar unidades sueltas?</span>
        </label>
        {usarUnidades && (
          <input type="number" min="0" value={cantidadUnidades} onChange={(e) => setCantidadUnidades(Number(e.target.value))} className="mt-2 w-full border rounded px-3 py-2" />
        )}
      </div>

      <div className="mb-6">
        <label className="block mb-1 font-medium">Descripción</label>
        <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows="3" className="w-full border rounded px-3 py-2" placeholder="Ej: Envío a sede norte..." />
      </div>

      <button onClick={handleRegistrar} className="btn-base" disabled={tipo === 'salida' && stockDisponible && (cantidad > stockDisponible.cajas || (usarUnidades && cantidadUnidades > stockDisponible.unidades))}>
        Registrar movimiento
      </button>

      <div className="mt-10">
        <h2 className="text-xl font-semibold text-blue-700 mb-4">Movimientos recientes</h2>

        <div className="flex flex-wrap gap-4 mb-4">
          <input type="date" value={filtroDesde} onChange={(e) => setFiltroDesde(e.target.value)} className="border rounded px-2 py-1" />
          <input type="date" value={filtroHasta} onChange={(e) => setFiltroHasta(e.target.value)} className="border rounded px-2 py-1" />
          <input type="text" placeholder="Buscar producto..." value={filtroProducto} onChange={(e) => setFiltroProducto(e.target.value)} className="border rounded px-2 py-1" />
          <button onClick={cargarMovimientos} className="btn-base">Aplicar filtros</button>
        </div>

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
