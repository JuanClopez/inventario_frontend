// ✅ src/pages/Movimientos.jsx – Versión 1.9.2 (Soporte user_id en stock)
// 🔄 Actualiza consulta de inventario a /inventario/:user_id/:product_id
// 🛡️ Extrae el user_id desde localStorage para consultas protegidas

import { useEffect, useState } from "react";
import api from "@/services/api";

const Movimientos = () => {
  const [tipo, setTipo] = useState("salida");
  const [familia, setFamilia] = useState("");
  const [producto, setProducto] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [usarUnidades, setUsarUnidades] = useState(false);
  const [cantidadUnidades, setCantidadUnidades] = useState(0);
  const [descripcion, setDescripcion] = useState("");

  const [familias, setFamilias] = useState([]);
  const [productosFull, setProductosFull] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);

  const [movimientos, setMovimientos] = useState([]);
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");
  const [filtroProducto, setFiltroProducto] = useState("");

  const [stockDisponible, setStockDisponible] = useState(null);
  const [cargandoStock, setCargandoStock] = useState(false);
  const [errorStock, setErrorStock] = useState("");

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [resFamilias, resProductos] = await Promise.all([
          api.get("/familias"),
          api.get("/productos"),
        ]);
        setFamilias(resFamilias.data);
        setProductosFull(resProductos.data);
      } catch (error) {
        console.error("❌ Error cargando catálogos:", error);
      }
    };
    cargarCatalogos();
  }, []);

  useEffect(() => {
    if (!familia) {
      setProductosFiltrados([]);
      return;
    }
    const filtrados = productosFull.filter((p) => p.familia === familia);
    setProductosFiltrados(filtrados);
    setProducto("");
    setStockDisponible(null);
    setErrorStock("");
  }, [familia, productosFull]);

  useEffect(() => {
    const cargarStock = async () => {
      if (!producto || tipo === "entrada") {
        setStockDisponible(null);
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

        setCargandoStock(true);
        const { data } = await api.get(`/inventario/${userId}/${producto}`);
        setStockDisponible(data);
        setErrorStock("");
      } catch (err) {
        console.error("❌ Error consultando stock:", err);
        setStockDisponible(null);
        setErrorStock("❌ No se pudo cargar el stock");
      } finally {
        setCargandoStock(false);
      }
    };
    cargarStock();
  }, [producto, tipo]);

  useEffect(() => {
    if (tipo === "salida" && stockDisponible) {
      const excedeCajas = cantidad > stockDisponible.cajas;
      const excedeUnidades =
        usarUnidades && cantidadUnidades > stockDisponible.unidades;

      if (excedeCajas || excedeUnidades) {
        setErrorStock("❌ La cantidad supera el stock disponible.");
      } else {
        setErrorStock("");
      }
    } else {
      setErrorStock("");
    }
  }, [cantidad, cantidadUnidades, stockDisponible, tipo, usarUnidades]);

  const camposValidos = () => {
    if (!producto || !familia || cantidad <= 0) return false;
    if (tipo === "salida" && stockDisponible) {
      if (cantidad > stockDisponible.cajas) return false;
      if (usarUnidades && cantidadUnidades > stockDisponible.unidades)
        return false;
    }
    return true;
  };

  const handleRegistrar = async () => {
    try {
      await api.post("/movimientos", {
        type: tipo,
        product_id: producto,
        quantity_boxes: cantidad,
        quantity_units: usarUnidades ? cantidadUnidades : 0,
        description: descripcion.trim(),
      });
      await cargarMovimientos();
      setFamilia("");
      setProducto("");
      setCantidad(1);
      setCantidadUnidades(0);
      setUsarUnidades(false);
      setDescripcion("");
      setStockDisponible(null);
    } catch (error) {
      alert(error.response?.data?.mensaje || "❌ Error al registrar");
    }
  };

  const cargarMovimientos = async () => {
    try {
      const params = new URLSearchParams();
      if (filtroDesde) params.append("desde", filtroDesde);
      if (filtroHasta) params.append("hasta", filtroHasta);
      if (filtroProducto) params.append("producto", filtroProducto);
      const { data } = await api.get(`/movimientos?${params.toString()}`);
      setMovimientos(data);
    } catch (error) {
      console.error("❌ Error al cargar movimientos:", error);
    }
  };

  useEffect(() => {
    cargarMovimientos();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">
        Registrar movimiento
      </h1>

      <div className="mb-4">
        <label className="mr-4">
          <input
            type="radio"
            value="salida"
            checked={tipo === "salida"}
            onChange={() => setTipo("salida")}
            className="mr-1"
          />
          Salida
        </label>
        <label>
          <input
            type="radio"
            value="entrada"
            checked={tipo === "entrada"}
            onChange={() => setTipo("entrada")}
            className="mr-1"
          />
          Entrada
        </label>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Familia</label>
        <select
          value={familia}
          onChange={(e) => setFamilia(e.target.value)}
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
        <label className="block mb-1 font-medium">Producto</label>
        <select
          value={producto}
          onChange={(e) => setProducto(e.target.value)}
          disabled={!familia}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Selecciona un producto</option>
          {productosFiltrados.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {producto && tipo === "salida" && (
          <p className="text-sm text-gray-600 mt-1">
            {cargandoStock
              ? "Cargando stock..."
              : stockDisponible
              ? `Stock actual: ${stockDisponible.cajas} cajas, ${stockDisponible.unidades} unidades`
              : "No disponible"}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Cantidad (cajas)</label>
        <input
          type="number"
          min="1"
          value={cantidad}
          onChange={(e) => setCantidad(Number(e.target.value))}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={usarUnidades}
            onChange={() => setUsarUnidades(!usarUnidades)}
          />
          <span>¿Registrar unidades sueltas?</span>
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

      {errorStock && (
        <p className="text-red-600 text-sm mb-2">{errorStock}</p>
      )}

      <div className="mb-6">
        <label className="block mb-1 font-medium">Descripción</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows="3"
          className="w-full border rounded px-3 py-2"
          placeholder="Ej: Envío a sede norte..."
        />
      </div>

      <button
        onClick={handleRegistrar}
        className={`btn-base transition-all ${
          !camposValidos()
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-700 hover:bg-blue-800 text-white"
        }`}
        disabled={!camposValidos()}
      >
        Registrar movimiento
      </button>

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
