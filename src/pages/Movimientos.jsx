// ✅ src/pages/Movimientos.jsx – Versión 2.0 (Actualización full con presentación_id)
// 🧠 Incluye soporte para presentaciones activas, stock, validaciones y carga automática
// 🔄 Migrado a schema con presentation_id en lugar de product_id
// 🆕 Visualiza nombre de la presentación en tabla y formulario
// 🔐 Consulta inventario y movimientos por presentación

import { useEffect, useState } from "react";
import api from "@/services/api";

const Movimientos = () => {
  const [tipo, setTipo] = useState("salida");
  const [familias, setFamilias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [presentaciones, setPresentaciones] = useState([]);

  const [familiaSeleccionada, setFamiliaSeleccionada] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [presentacionSeleccionada, setPresentacionSeleccionada] = useState("");

  const [cantidad, setCantidad] = useState(1);
  const [usarUnidades, setUsarUnidades] = useState(false);
  const [cantidadUnidades, setCantidadUnidades] = useState(0);
  const [descripcion, setDescripcion] = useState("");

  const [stock, setStock] = useState(null);
  const [errorStock, setErrorStock] = useState("");

  const [movimientos, setMovimientos] = useState([]);

  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");
  const [filtroProducto, setFiltroProducto] = useState("");

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

  useEffect(() => {
    cargarCatalogos();
  }, []);

  useEffect(() => {
    setProductoSeleccionado("");
    setPresentaciones([]);
    setPresentacionSeleccionada("");
    setStock(null);
    setErrorStock("");
  }, [familiaSeleccionada]);

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

  useEffect(() => {
    const cargarStock = async () => {
      if (!presentacionSeleccionada || tipo === "entrada") {
        setStock(null);
        setErrorStock("");
        return;
      }

      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const userId = userData?.user?.id;

        if (!userId) {
          setErrorStock("❌ Usuario no autenticado");
          return;
        }

        const { data } = await api.get(
          `/inventario/${userId}/${presentacionSeleccionada}`
        );
        setStock(data);
        setErrorStock("");
      } catch (err) {
        console.error("❌ Error al obtener stock:", err);
        setStock(null);
        setErrorStock("❌ No se pudo cargar el stock");
      }
    };

    cargarStock();
  }, [presentacionSeleccionada, tipo]);

  useEffect(() => {
    if (tipo === "salida" && stock) {
      const excedeCajas = cantidad > stock.cajas;
      const excedeUnidades =
        usarUnidades && cantidadUnidades > stock.unidades;

      if (excedeCajas || excedeUnidades) {
        setErrorStock("❌ La cantidad supera el stock disponible.");
      } else {
        setErrorStock("");
      }
    } else {
      setErrorStock("");
    }
  }, [cantidad, cantidadUnidades, stock, tipo, usarUnidades]);

  const handleRegistrar = async () => {
    try {
      await api.post("/movimientos", {
        type: tipo,
        presentation_id: presentacionSeleccionada,
        quantity_boxes: cantidad,
        quantity_units: usarUnidades ? cantidadUnidades : 0,
        description: descripcion.trim(),
      });

      await cargarMovimientos();
      resetFormulario();
    } catch (err) {
      alert(err.response?.data?.mensaje || "❌ Error al registrar movimiento");
    }
  };

  const resetFormulario = () => {
    setFamiliaSeleccionada("");
    setProductoSeleccionado("");
    setPresentaciones([]);
    setPresentacionSeleccionada("");
    setCantidad(1);
    setCantidadUnidades(0);
    setUsarUnidades(false);
    setDescripcion("");
    setStock(null);
    setErrorStock("");
  };

  const cargarMovimientos = async () => {
    try {
      const params = new URLSearchParams();
      if (filtroDesde) params.append("desde", filtroDesde);
      if (filtroHasta) params.append("hasta", filtroHasta);
      if (filtroProducto) params.append("producto", filtroProducto);

      const { data } = await api.get(`/movimientos?${params.toString()}`);
      setMovimientos(data);
    } catch (err) {
      console.error("❌ Error al cargar movimientos:", err);
    }
  };

  useEffect(() => {
    cargarMovimientos();
  }, []);

  const camposValidos = () => {
    if (!presentacionSeleccionada || cantidad <= 0) return false;
    if (tipo === "salida" && stock) {
      if (cantidad > stock.cajas) return false;
      if (usarUnidades && cantidadUnidades > stock.unidades) return false;
    }
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">
        Registrar movimiento
      </h1>

      <div className="mb-4 flex gap-4">
        <label>
          <input
            type="radio"
            value="salida"
            checked={tipo === "salida"}
            onChange={() => setTipo("salida")}
            className="mr-2"
          />
          Salida
        </label>
        <label>
          <input
            type="radio"
            value="entrada"
            checked={tipo === "entrada"}
            onChange={() => setTipo("entrada")}
            className="mr-2"
          />
          Entrada
        </label>
      </div>

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

        {stock && tipo === "salida" && (
          <p className="text-sm text-gray-600 mt-1">
            Stock actual: {stock.cajas} cajas, {stock.unidades} unidades
          </p>
        )}
      </div>

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
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={usarUnidades}
            onChange={() => setUsarUnidades(!usarUnidades)}
          />
          Registrar unidades sueltas
        </label>
        {usarUnidades && (
          <input
            type="number"
            min="0"
            value={cantidadUnidades}
            onChange={(e) => setCantidadUnidades(Number(e.target.value))}
            className="mt-2 w-full border rounded px-3 py-2"
          />
        )}
      </div>

      {errorStock && <p className="text-red-600 text-sm">{errorStock}</p>}

      <div className="mb-6">
        <label className="block font-medium mb-1">Descripción</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows="3"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        onClick={handleRegistrar}
        disabled={!camposValidos()}
        className={`btn-base transition-all ${
          !camposValidos()
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-700 hover:bg-blue-800 text-white"
        }`}
      >
        Registrar movimiento
      </button>

      {/* 🔽 Tabla de movimientos recientes */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-blue-700 mb-4">
          Movimientos recientes
        </h2>

        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="date"
            value={filtroDesde}
            onChange={(e) => setFiltroDesde(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <input
            type="date"
            value={filtroHasta}
            onChange={(e) => setFiltroHasta(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={filtroProducto}
            onChange={(e) => setFiltroProducto(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <button onClick={cargarMovimientos} className="btn-base">
            Aplicar filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="text-left px-4 py-2">Fecha</th>
                <th className="text-left px-4 py-2">Tipo</th>
                <th className="text-left px-4 py-2">Familia</th>
                <th className="text-left px-4 py-2">Producto</th>
                <th className="text-left px-4 py-2">Presentación</th>
                <th className="text-left px-4 py-2">Cajas</th>
                <th className="text-left px-4 py-2">Unidades</th>
                <th className="text-left px-4 py-2">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id} className="border-t text-sm">
                  <td className="px-4 py-2">
                    {new Date(m.fecha).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 capitalize">{m.tipo}</td>
                  <td className="px-4 py-2">{m.familia}</td>
                  <td className="px-4 py-2">{m.producto}</td>
                  <td className="px-4 py-2">{m.presentacion}</td>
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
