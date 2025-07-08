// ✅ src/pages/VentasCarrito.jsx – Versión 2.2 (06 jul 2025)
// 🛒 Página de ventas agrupadas con presentación, precio, IVA y descuento por producto
// 🔁 Correcciones:
// - ❌ Eliminado user_id manual (se usa token JWT)
// - ✅ Endpoint de stock actualizado a /inventario/:presentation_id

import { useEffect, useState } from 'react';
import api from '@/services/api';

const VentasCarrito = () => {
  const [familias, setFamilias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [presentaciones, setPresentaciones] = useState([]);
  const [presentacionSeleccionada, setPresentacionSeleccionada] = useState(null);
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
  const [descripcionVenta, setDescripcionVenta] = useState('');

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
    setPresentacionSeleccionada(null);
    setPrecio(null);
    setIva(0);
    setStock(null);
    setErrorStock('');
    setPresentaciones([]);

    try {
      const resPres = await api.get(`/presentaciones/${idProducto}`);
      setPresentaciones(resPres.data.presentaciones || []);
    } catch (err) {
      console.error('Error al cargar presentaciones:', err);
      setPresentaciones([]);
    }
  };

  const manejarSeleccionPresentacion = async (idPresentacion) => {
    setPresentacionSeleccionada(idPresentacion);
    setPrecio(null);
    setIva(0);
    setStock(null);
    setErrorStock('');

    try {
      const resPrecio = await api.get(`/precios/${idPresentacion}`);
      const { price, iva_rate } = resPrecio.data.precio || {};
      setPrecio(parseFloat(price || 0));
      setIva(parseFloat(iva_rate || 0));
    } catch {
      setPrecio(0);
      setIva(0);
    }

    try {
      const resStock = await api.get(`/inventario/${idPresentacion}`);
      setStock(resStock.data);
    } catch (err) {
      console.error('Error al cargar stock:', err);
      setStock(null);
      setErrorStock('❌ No se pudo cargar el inventario de la presentación');
    }
  };

  useEffect(() => {
    if (!presentacionSeleccionada || !stock) {
      setErrorStock('');
      return;
    }

    if (cantidadCajas > stock.cajas) {
      setErrorStock('❌ La cantidad supera el stock disponible.');
    } else {
      setErrorStock('');
    }
  }, [cantidadCajas, stock, presentacionSeleccionada]);

  const agregarAlCarrito = () => {
    if (!productoSeleccionado || !presentacionSeleccionada || cantidadCajas <= 0 || cantidadCajas > stock?.cajas) return;

    const unitPrice = precio;
    const subtotal = unitPrice * cantidadCajas;
    const ivaAmount = (subtotal * iva) / 100;
    const descuentoTotal = (subtotal * descuento) / 100;
    const total = subtotal + ivaAmount - descuentoTotal;

    const presentacion = presentaciones.find(p => p.id === presentacionSeleccionada);

    setCarrito([
      ...carrito,
      {
        producto_id: productoSeleccionado.id,
        presentation_id: presentacionSeleccionada,
        nombre: productoSeleccionado.name,
        presentacion: presentacion?.presentation_name || '',
        familia: productoSeleccionado.familia,
        cantidad: cantidadCajas,
        unitPrice,
        descuento: descuentoTotal,
        iva: ivaAmount,
        total,
        descuentoPorcentaje: descuento
      }
    ]);

    setProductoSeleccionado(null);
    setPresentacionSeleccionada(null);
    setCantidadCajas(1);
    setDescuento(0);
    setPrecio(null);
    setIva(0);
    setStock(null);
    setErrorStock('');
    setPresentaciones([]);
  };

  const eliminarItem = (index) => {
    const nuevo = [...carrito];
    nuevo.splice(index, 1);
    setCarrito(nuevo);
  };

  const registrarVenta = async () => {
    if (carrito.length === 0) return;

    setCargando(true);
    setMensaje('');

    try {
      const items = carrito.map(item => ({
        product_id: item.producto_id,
        presentation_id: item.presentation_id,
        quantity_boxes: item.cantidad,
        quantity_units: 0,
        discount: item.descuento
      }));

      await api.post('/ventas', {
        items,
        description: descripcionVenta
      });

      setMensaje('✅ Venta registrada con éxito');
      setCarrito([]);
      setDescripcionVenta('');
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

      {/* ... componente visual ... */}
    </main>
  );
};

export default VentasCarrito;
