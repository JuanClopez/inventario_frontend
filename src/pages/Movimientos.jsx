// ✅ VentasCarrito.jsx – Versión 2.8.2 (13 jul 2025)
// 🛠 Actualización completa con validación de stock, presentación_id y fixes de botón
// 🔁 Corrige errores de visualización y validación
// 🧠 Basado en comportamiento funcional de Movimientos.jsx

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
  const [errorStock, setErrorStock] = useState("");

  const [precioUnitario, setPrecioUnitario] = useState(0);
  const [descuento, setDescuento] = useState(0);
  const [carrito, setCarrito] = useState([]);

  // ✅ Cargar familias y productos
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

  // ✅ Reset al cambiar familia
  useEffect(() => {
    setProductoSeleccionado("");
    setPresentaciones([]);
    setPresentacionSeleccionada("");
    setStock(null);
    setErrorStock("");
    setPrecioUnitario(0);
  }, [familiaSeleccionada]);

  // ✅ Cargar presentaciones al elegir producto
  useEffect(() => {
    const cargarPresentaciones = async () => {
      if (!productoSeleccionado) return;
      try {
        const { data } = await api.get(
          `/presentaciones/${productoSeleccionado}`
        );
        const disponibles = data.presentaciones || [];
        setPresentaciones(disponibles);
        if (disponibles.length === 1) {
          setPresentacionSeleccionada(disponibles[0].id);
        }
      } catch (err) {
        console.error("❌ Error al cargar presentaciones:", err);
      }
    };

    cargarPresentaciones();
  }, [productoSeleccionado]);

  // ✅ Cargar stock y precio al cambiar presentación
  useEffect(() => {
    const cargarDatosPresentacion = async () => {
      if (!presentacionSeleccionada) {
        setStock(null);
        setErrorStock("");
        setPrecioUnitario(0);
        return;
      }

      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const userId = userData?.user?.id;

        if (!userId) {
          setErrorStock("❌ Usuario no autenticado");
          return;
        }

        const [resInventario, resPrecio] = await Promise.all([
          api.get(`/inventario/${userId}/${presentacionSeleccionada}`),
          api.get(`/precios/${presentacionSeleccionada}`),
        ]);

        setStock(resInventario.data);
        setPrecioUnitario(resPrecio.data?.precio_unitario || 0);
        setErrorStock("");
      } catch (err) {
        console.error("❌ Error al cargar datos de presentación:", err);
        setStock(null);
        setPrecioUnitario(0);
        setErrorStock("❌ No se pudo cargar el stock o precio");
      }
    };

    cargarDatosPresentacion();
  }, [presentacionSeleccionada]);

  // ✅ Validación de cantidad contra stock
  useEffect(() => {
    if (!stock) return;

    const excedeStock = cantidad > stock.cajas;

    if (excedeStock) {
      setErrorStock("❌ La cantidad supera el stock disponible");
    } else {
      setErrorStock("");
    }
  }, [cantidad, stock]);

  // ✅ Agregar al carrito
  const agregarAlCarrito = () => {
    if (!presentacionSeleccionada || cantidad <= 0 || !stock || cantidad > stock.cajas) {
      setErrorStock("❌ No se puede agregar este producto al carrito");
      return;
    }

    const presentacion = presentaciones.find((p) => p.id === presentacionSeleccionada);

    const nuevoItem = {
      presentation_id: presentacionSeleccionada,
      nombre: presentacion?.presentation_name || "Sin nombre",
      cantidad,
      precioUnitario,
      descuento,
      subtotal: (cantidad * precioUnitario * (1 - descuento / 100)).toFixed(2),
    };

    setCarrito([...carrito, nuevoItem]);
    setCantidad(1);
    setErrorStock("");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Venta rápida</h1>

      {/* 🔽 Selectores de familia, producto y presentación */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Familia</label>
        <select
          value={familiaSeleccionada}
          onChange={(e) => setFamiliaSeleccionada(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Selecciona una familia</option>
          {familias.map((f) => (
            <option key={f.id} value={f.name}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Producto</label>
        <select
          value={productoSeleccionado}
          onChange={(e) => setProductoSeleccionado(e.target.value)}
          className="w-full border rounded px-3 py-2"
          disabled={!familiaSeleccionada}
        >
          <option value="">Selecciona un producto</option>
          {productos
            .filter((p) => p.familia === familiaSeleccionada)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Presentación</label>
        <select
          value={presentacionSeleccionada}
          onChange={(e) => setPresentacionSeleccionada(e.target.value)}
          className="w-full border rounded px-3 py-2"
          disabled={!productoSeleccionado}
        >
          <option value="">Selecciona una presentación</option>
          {presentaciones.map((p) => (
            <option key={p.id} value={p.id}>
              {p.presentation_name}
            </option>
          ))}
        </select>

        {/* ✅ Mostrar stock si disponible */}
        {stock && (
          <p className="text-sm text-gray-600 mt-1">
            Stock actual: {stock.cajas} cajas, {stock.unidades} unidades
          </p>
        )}
      </div>

      {/* 🔽 Campos de cantidad, descuento y validación */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Cantidad (cajas)</label>
        <input
          type="number"
          min="1"
          value={cantidad}
          onChange={(e) => setCantidad(Number(e.target.value))}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Descuento (%)</label>
        <input
          type="number"
          min="0"
          max="100"
          value={descuento}
          onChange={(e) => setDescuento(Number(e.target.value))}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {errorStock && <p className="text-red-600 text-sm">{errorStock}</p>}

      {/* 🔽 Botón agregar */}
      <button
        onClick={agregarAlCarrito}
        disabled={!presentacionSeleccionada || cantidad <= 0 || errorStock}
        className={`btn-base mt-2 transition-all ${
          !presentacionSeleccionada || cantidad <= 0 || errorStock
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-700 hover:bg-green-800 text-white"
        }`}
      >
        Agregar al carrito
      </button>

      {/* 🔽 Lista de carrito */}
      {carrito.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">Carrito</h2>
          <table className="min-w-full bg-white border border-gray-200 text-sm">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Presentación</th>
                <th className="px-4 py-2 text-left">Cantidad</th>
                <th className="px-4 py-2 text-left">Precio</th>
                <th className="px-4 py-2 text-left">Descuento</th>
                <th className="px-4 py-2 text-left">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {carrito.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">{item.nombre}</td>
                  <td className="px-4 py-2">{item.cantidad}</td>
                  <td className="px-4 py-2">${item.precioUnitario}</td>
                  <td className="px-4 py-2">{item.descuento}%</td>
                  <td className="px-4 py-2">${item.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VentasCarrito;
