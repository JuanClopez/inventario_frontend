// 📄 VentasCarrito.jsx – Versión 3.2.0
// 📅 Fecha: 13-jul-2025
// ✅ Soporta datos incompletos desde el backend (precio_base, iva, precio_con_iva)
// 🔒 Refuerza validaciones para evitar errores si faltan campos o llegan valores nulos
// 🔄 Aplica redondeo seguro en todos los cálculos

import { useEffect, useState } from "react";
import api from "@/services/api";

const VentasCarrito = () => {
  const [familias, setFamilias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [presentaciones, setPresentaciones] = useState([]);

  const [familiaSeleccionada, setFamiliaSeleccionada] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [presentacionSeleccionada, setPresentacionSeleccionada] = useState("");
  const [cantidad, setCantidad] = useState(1);

  const [stock, setStock] = useState(null);
  const [precioBase, setPrecioBase] = useState(0);
  const [ivaRate, setIvaRate] = useState(0);
  const [precioConIva, setPrecioConIva] = useState(0);
  const [errorStock, setErrorStock] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [descuento, setDescuento] = useState(0);

  const userId = JSON.parse(localStorage.getItem("userData"))?.user?.id;

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [resFamilias, resProductos] = await Promise.all([
          api.get("/familias"),
          api.get("/productos"),
        ]);
        setFamilias(resFamilias.data);
        setProductos(resProductos.data);
      } catch (err) {
        console.error("❌ Error al cargar catálogos:", err);
      }
    };
    cargarCatalogos();
  }, []);

  useEffect(() => {
    setProductoSeleccionado("");
    setPresentaciones([]);
    setPresentacionSeleccionada("");
    setStock(null);
    setPrecioBase(0);
    setPrecioConIva(0);
    setDescuento(0);
  }, [familiaSeleccionada]);

  useEffect(() => {
    const cargarPresentaciones = async () => {
      if (!productoSeleccionado) return;
      try {
        const { data } = await api.get(`/presentaciones/${productoSeleccionado}`);
        const presentacionesActivas = data.presentaciones || [];
        setPresentaciones(presentacionesActivas);
        if (presentacionesActivas.length === 1) {
          setPresentacionSeleccionada(presentacionesActivas[0].id);
        }
      } catch (err) {
        console.error("❌ Error al cargar presentaciones:", err);
      }
    };
    cargarPresentaciones();
  }, [productoSeleccionado]);

  useEffect(() => {
    const cargarStock = async () => {
      if (!presentacionSeleccionada || !userId) return;
      try {
        const { data } = await api.get(`/inventario/${userId}/${presentacionSeleccionada}`);
        setStock(data);
        setErrorStock("");
      } catch (err) {
        console.error("❌ Error al cargar stock:", err);
        setStock(null);
        setErrorStock("❌ No se pudo cargar el stock");
      }
    };
    cargarStock();
  }, [presentacionSeleccionada, userId]);

  useEffect(() => {
    const cargarPrecio = async () => {
      if (!presentacionSeleccionada || !productoSeleccionado) return;
      try {
        const { data } = await api.get(`/precios/${productoSeleccionado}/${presentacionSeleccionada}`);
        if (!data) {
          alert("❌ Esta presentación no tiene precio asignado.");
          setPrecioBase(0);
          setPrecioConIva(0);
          return;
        }

        const precio = parseFloat(data.precio_base || 0);
        const iva = parseFloat(data.iva || 0);
        const conIva = parseFloat(data.precio_con_iva || 0);

        if (precio === 0 || conIva === 0) {
          alert("❌ Precio inválido o no asignado para esta presentación.");
          setPrecioBase(0);
          setPrecioConIva(0);
          return;
        }

        setPrecioBase(precio);
        setIvaRate(iva);
        setPrecioConIva(Math.round(conIva));
      } catch (err) {
        console.error("❌ Error al cargar precio:", err);
        setPrecioBase(0);
        setPrecioConIva(0);
      }
    };
    cargarPrecio();
  }, [presentacionSeleccionada, productoSeleccionado]);

  const stockSuficiente = stock && cantidad <= stock.cajas;

  const calcularItemVenta = () => {
    const netoBruto = precioBase * cantidad;
    const descuentoTotal = Math.round(netoBruto * (descuento / 100));
    const netoFinal = netoBruto - descuentoTotal;
    const ivaTotal = Math.round(netoFinal * ivaRate);
    const total = netoFinal + ivaTotal;

    return { netoFinal, ivaTotal, descuentoTotal, total };
  };

  const agregarAlCarrito = () => {
    if (!stockSuficiente || !presentacionSeleccionada || cantidad <= 0 || precioBase === 0) return;

    const presentacion = presentaciones.find((p) => p.id === presentacionSeleccionada);
    const producto = productos.find((p) => p.id === productoSeleccionado);
    const familia = familias.find((f) => f.name === familiaSeleccionada);

    const { netoFinal, ivaTotal, descuentoTotal, total } = calcularItemVenta();

    const nuevoItem = {
      id: crypto.randomUUID(),
      presentacion_id: presentacionSeleccionada,
      nombre_presentacion: presentacion?.presentation_name,
      nombre_producto: producto?.name,
      nombre_familia: familia?.name,
      cantidad,
      precio_unitario: precioConIva,
      descuento_total: descuentoTotal,
      subtotal: netoFinal,
      iva_total: ivaTotal,
      total,
    };

    setCarrito([...carrito, nuevoItem]);
    setProductoSeleccionado("");
    setPresentacionSeleccionada("");
    setCantidad(1);
    setStock(null);
    setPrecioBase(0);
    setPrecioConIva(0);
    setDescuento(0);
  };

  const eliminarItem = (id) => {
    setCarrito(carrito.filter((item) => item.id !== id));
  };

  const totalNeto = carrito.reduce((sum, item) => sum + item.subtotal, 0);
  const totalIVA = carrito.reduce((sum, item) => sum + item.iva_total, 0);
  const totalDescuentos = carrito.reduce((sum, item) => sum + item.descuento_total, 0);
  const totalVenta = carrito.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Ventas (Carrito)</h1>

      {/* Formulario */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label>Familia</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={familiaSeleccionada}
            onChange={(e) => setFamiliaSeleccionada(e.target.value)}
          >
            <option value="">Selecciona</option>
            {familias.map((f) => (
              <option key={f.id} value={f.name}>{f.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Producto</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={productoSeleccionado}
            onChange={(e) => setProductoSeleccionado(e.target.value)}
            disabled={!familiaSeleccionada}
          >
            <option value="">Selecciona</option>
            {productos
              .filter((p) => p.familia === familiaSeleccionada)
              .map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
          </select>
        </div>

        <div>
          <label>Presentación</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={presentacionSeleccionada}
            onChange={(e) => setPresentacionSeleccionada(e.target.value)}
            disabled={!productoSeleccionado}
          >
            <option value="">Selecciona</option>
            {presentaciones.map((p) => (
              <option key={p.id} value={p.id}>{p.presentation_name}</option>
            ))}
          </select>
          {stock && (
            <p className="text-sm text-gray-600 mt-1">
              Stock disponible: {stock.cajas} cajas
            </p>
          )}
          {errorStock && <p className="text-sm text-red-600">{errorStock}</p>}
        </div>

        <div>
          <label>Cantidad</label>
          <input
            type="number"
            min={1}
            value={cantidad}
            onChange={(e) => setCantidad(+e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label>Precio (con IVA)</label>
          <input
            type="number"
            readOnly
            value={precioConIva}
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        <div>
          <label>Descuento (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={descuento}
            onChange={(e) => setDescuento(+e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <button
        onClick={agregarAlCarrito}
        disabled={!stockSuficiente || !presentacionSeleccionada || precioBase === 0}
        className={`mt-4 px-4 py-2 rounded text-white ${
          !stockSuficiente || !presentacionSeleccionada || precioBase === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-700 hover:bg-blue-800"
        }`}
      >
        Agregar al carrito
      </button>

      {carrito.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Resumen del carrito</h2>
          <table className="min-w-full border text-sm">
            <thead className="bg-blue-100">
              <tr>
                <th>Familia</th>
                <th>Producto</th>
                <th>Presentación</th>
                <th>Cant.</th>
                <th>Precio</th>
                <th>Descuento</th>
                <th>Subtotal</th>
                <th>IVA</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {carrito.map((item) => (
                <tr key={item.id} className="border-t">
                  <td>{item.nombre_familia}</td>
                  <td>{item.nombre_producto}</td>
                  <td>{item.nombre_presentacion}</td>
                  <td>{item.cantidad}</td>
                  <td>${item.precio_unitario}</td>
                  <td>${item.descuento_total}</td>
                  <td>${item.subtotal}</td>
                  <td>${item.iva_total}</td>
                  <td className="font-bold">${item.total}</td>
                  <td>
                    <button
                      onClick={() => eliminarItem(item.id)}
                      className="text-red-600 hover:scale-110 text-lg"
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 text-right space-y-1">
            <p>Subtotal neto: <strong>${Math.round(totalNeto)}</strong></p>
            <p>IVA total: <strong>${Math.round(totalIVA)}</strong></p>
            <p>Descuentos totales: <strong>${Math.round(totalDescuentos)}</strong></p>
            <p>Total venta: <strong>${Math.round(totalVenta)}</strong></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VentasCarrito;
