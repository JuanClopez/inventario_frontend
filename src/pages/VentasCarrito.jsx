// ✅ src/pages/VentasCarrito.jsx – Versión 1.2 (01 jul 2025)
// 🛒 Página de ventas agrupadas con precio, IVA, descuento y control de stock
// ⚠️ No permite agregar si la cantidad excede el inventario del producto

import { useEffect, useState } from 'react';
import api from '@/services/api';

const VentasCarrito = () => {
  const [familias, setFamilias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [familiaSeleccionada, setFamiliaSeleccionada] = useState('');
  const [cantidadCajas, setCantidadCajas] = useState(1);
  const [descuento, setDescuento] = useState(0);
  const [precio, setPrecio] = useState(null);
  const [iva, setIva] = useState(0);
  const [stock, setStock] = useState(null);
  const [errorStock, setErrorStock] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const userData = JSON.parse(localStorage.getItem('userData'));
  const user_id = userData?.user?.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resProd = await api.get('/productos');
        setProductos(resProd.data);
        const familiasUnicas = [...new Set(resProd.data.map(p => p.familia))];
        setFamilias(familiasUnicas);
      } catch (err) {
        console.error('Error al cargar productos:', err);
      }
    };
    fetchData();
  }, []);

  const productosFiltrados = productos.filter(p => p.familia === familiaSeleccionada);

  const manejarSeleccionProducto = async (idProducto) => {
    const prod = productos.find(p => p.id === idProducto);
    setProductoSeleccionado(prod);
    setPrecio(null);
    setIva(0);
    setStock(null);
    setErrorStock('');

    try {
      const resPrecio = await api.get(`/precios/${idProducto}`);
      const { price, iva_rate } = resPrecio.data || {};
      setPrecio(parseFloat(price || 0));
      setIva(parseFloat(iva_rate || 0));
    } catch {
      setPrecio(0);
      setIva(0);
    }

    try {
      const resStock = await api.get(`/inventario/${user_id}/${idProducto}`);
      setStock(resStock.data);
    } catch (err) {
      console.error('Error al cargar stock:', err);
      setStock(null);
      setErrorStock('❌ No se pudo cargar el inventario del producto');
    }
  };

  useEffect(() => {
    if (!productoSeleccionado || !stock) {
      setErrorStock('');
      return;
    }

    if (cantidadCajas > stock.cajas) {
      setErrorStock('❌ La cantidad supera el stock disponible.');
    } else {
      setErrorStock('');
    }
  }, [cantidadCajas, stock, productoSeleccionado]);

  const agregarAlCarrito = () => {
    if (!productoSeleccionado || cantidadCajas <= 0 || cantidadCajas > stock?.cajas) return;

    const unitPrice = precio;
    const subtotal = unitPrice * cantidadCajas;
    const ivaAmount = (subtotal * iva) / 100;
    const descuentoTotal = descuento;
    const total = subtotal + ivaAmount - descuentoTotal;

    setCarrito([
      ...carrito,
      {
        producto_id: productoSeleccionado.id,
        nombre: productoSeleccionado.name,
        familia: productoSeleccionado.familia,
        cantidad: cantidadCajas,
        unitPrice,
        descuento: descuentoTotal,
        iva: ivaAmount,
        total
      }
    ]);

    setProductoSeleccionado(null);
    setCantidadCajas(1);
    setDescuento(0);
    setPrecio(null);
    setIva(0);
    setStock(null);
    setErrorStock('');
  };

  const eliminarItem = (index) => {
    const nuevo = [...carrito];
    nuevo.splice(index, 1);
    setCarrito(nuevo);
  };

  const registrarVenta = async () => {
    if (carrito.length === 0 || !user_id) return;

    setCargando(true);
    setMensaje('');

    try {
      const items = carrito.map(item => ({
        product_id: item.producto_id,
        quantity_boxes: item.cantidad,
        quantity_units: 0,
        discount: item.descuento
      }));

      await api.post('/ventas', { user_id, items });

      setMensaje('✅ Venta registrada con éxito');
      setCarrito([]);
    } catch (err) {
      setMensaje('❌ Error al registrar la venta');
      console.error(err);
    }

    setCargando(false);
  };

  const totalVenta = carrito.reduce((acc, item) => acc + item.total, 0);

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">🛒 Registrar Venta</h1>

      <section className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Familia</label>
          <select
            value={familiaSeleccionada}
            onChange={(e) => setFamiliaSeleccionada(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Seleccione...</option>
            {familias.map((f, i) => (
              <option key={i} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Producto</label>
          <select
            value={productoSeleccionado?.id || ''}
            onChange={(e) => manejarSeleccionProducto(e.target.value)}
            className="w-full border rounded px-3 py-2"
            disabled={!familiaSeleccionada}
          >
            <option value="">Seleccione...</option>
            {productosFiltrados.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {stock && (
            <p className="text-sm text-gray-600 mt-1">
              Stock actual: {stock.cajas} cajas, {stock.unidades} unidades
            </p>
          )}
          {errorStock && <p className="text-sm text-red-600 mt-1">{errorStock}</p>}
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Cantidad de cajas</label>
          <input
            type="number"
            value={cantidadCajas}
            onChange={(e) => setCantidadCajas(Number(e.target.value))}
            min={1}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Descuento total ($)</label>
          <input
            type="number"
            value={descuento}
            onChange={(e) => setDescuento(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={agregarAlCarrito}
            className={`btn-base w-full transition-all ${
              errorStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800 text-white'
            }`}
            disabled={!!errorStock}
          >
            Agregar
          </button>
        </div>
      </section>

      {carrito.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">🧾 Productos en esta venta</h2>
          <div className="overflow-auto border border-gray-200 rounded-md">
            <table className="min-w-full text-sm bg-white text-center">
              <thead className="bg-blue-100 text-gray-700">
                <tr>
                  <th className="px-2 py-2">Familia</th>
                  <th className="px-2 py-2">Producto</th>
                  <th className="px-2 py-2">Cajas</th>
                  <th className="px-2 py-2">Precio unitario</th>
                  <th className="px-2 py-2">IVA</th>
                  <th className="px-2 py-2">Descuento</th>
                  <th className="px-2 py-2">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {carrito.map((item, i) => (
                  <tr key={i} className="border-t">
                    <td>{item.familia}</td>
                    <td>{item.nombre}</td>
                    <td>{item.cantidad}</td>
                    <td>${item.unitPrice.toFixed(2)}</td>
                    <td>${item.iva.toFixed(2)}</td>
                    <td>${item.descuento.toFixed(2)}</td>
                    <td>${item.total.toFixed(2)}</td>
                    <td>
                      <button
                        onClick={() => eliminarItem(i)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-right mt-4 text-blue-700 font-bold text-lg">
            Total: ${totalVenta.toFixed(2)}
          </div>

          <button
            onClick={registrarVenta}
            className="btn-base mt-4 w-full"
            disabled={cargando}
          >
            {cargando ? 'Registrando...' : 'Registrar venta'}
          </button>
        </section>
      )}

      {mensaje && <p className="mt-4 text-center text-blue-600 font-semibold">{mensaje}</p>}
    </main>
  );
};

export default VentasCarrito;
