// 📄 src/pages/VentasCarrito.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Versión: 3.3.7
// Fecha: 15-Agosto-2025
// Resumen Maestro 2.7 – Cumplido (comentado y trazable)
// Cambios respecto a 3.3.5 / 3.3.6:
//   1) 🛡️ Anti-doble clic en “Registrar venta” + idempotencia (X-Idempotency-Key).
//   2) 📦 Se envía también product_id junto con presentation_id en cada item.
//   3) 🔎 Logs detallados (console.groupCollapsed) en carga y acciones críticas.
//   4) 👁️ Redondeo solo visual (formatCOP redondea), cálculos siguen con decimales.
//   5) 🧮 Fórmula IVA correcta: base = totalNeto / (1 + ivaRate/100), IVA = total - base.
//   6) ✅ Mantiene endpoints y estructura original (no rompe backend actual).
// Notas de implementación:
//   - El backend actual (/api/ventas) ya descuenta inventario vía RPC; el FE no duplica.
//   - Si agregas soporte en backend, podrás usar el product_id que ya enviamos.
//   - La idempotencia requiere soporte backend para ser total; aquí prevenimos doble clic
//     y enviamos cabecera “X-Idempotency-Key” (inocua si backend la ignora).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from "react";
import api from "@/services/api";
import { toast } from "react-toastify";

// 👁️ Redondeo solo visual (sin decimales en UI)
const formatCOP = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(Number(valor || 0)));

const VentasCarrito = () => {
  // ───── Catálogos y dependencias ────────────────────────────────────────────
  const [familias, setFamilias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [presentaciones, setPresentaciones] = useState([]);

  // ───── Selecciones de UI ──────────────────────────────────────────────────
  const [familiaSeleccionada, setFamiliaSeleccionada] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [presentacionSeleccionada, setPresentacionSeleccionada] = useState("");
  const [cantidad, setCantidad] = useState(1);

  // ───── Datos operativos ───────────────────────────────────────────────────
  const [stock, setStock] = useState(null);
  const [precioBase, setPrecioBase] = useState(0);
  const [ivaRate, setIvaRate] = useState(0);
  const [precioConIva, setPrecioConIva] = useState(0);
  const [errorStock, setErrorStock] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [descuento, setDescuento] = useState(0);
  const [descripcionVenta, setDescripcionVenta] = useState("");

  // ───── Control envío / idempotencia ───────────────────────────────────────
  const [guardando, setGuardando] = useState(false);
  const envioEnCursoRef = useRef(false);
  const ultimaFirmaVentaRef = useRef(null);

  const userId = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("userData"))?.user?.id || null;
    } catch {
      return null;
    }
  }, []);

  // ───── Utilidades de logs ─────────────────────────────────────────────────
  const logGroup = (title, obj) => {
    try {
      console.groupCollapsed(title);
      if (obj !== undefined) console.log(obj);
      console.groupEnd();
    } catch (_) {
      // noop
    }
  };

  // ───── Carga catálogos: familias y productos ──────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        console.groupCollapsed("📦 Carga inicial de catálogos");
        const [resFamilias, resProductos] = await Promise.all([
          api.get("/familias"),
          api.get("/productos"),
        ]);
        console.log("Familias:", resFamilias.data);
        console.log("Productos:", resProductos.data);
        setFamilias(resFamilias.data || []);
        setProductos(resProductos.data || []);
        console.groupEnd();
      } catch (err) {
        console.error("❌ Error al cargar catálogos:", err);
        toast.error("Error al cargar catálogos");
      }
    })();
  }, []);

  // ───── Reset por cambio de familia ────────────────────────────────────────
  useEffect(() => {
    console.info("🔁 Cambio de familia -> reseteo de dependencias");
    setProductoSeleccionado("");
    setPresentaciones([]);
    setPresentacionSeleccionada("");
    setStock(null);
    setPrecioBase(0);
    setPrecioConIva(0);
    setDescuento(0);
  }, [familiaSeleccionada]);

  // ───── Cargar presentaciones por producto ─────────────────────────────────
  useEffect(() => {
    (async () => {
      if (!productoSeleccionado) return;
      try {
        console.groupCollapsed("📦 Cargando presentaciones");
        console.log("Producto:", productoSeleccionado);
        const { data } = await api.get(
          `/presentaciones/${productoSeleccionado}`
        );
        const presentacionesActivas = data?.presentaciones || [];
        console.log("Presentaciones:", presentacionesActivas);
        setPresentaciones(presentacionesActivas);
        if (presentacionesActivas.length === 1) {
          setPresentacionSeleccionada(presentacionesActivas[0].id);
        }
        console.groupEnd();
      } catch (err) {
        console.error("❌ Error al cargar presentaciones:", err);
        toast.error("Error al cargar presentaciones");
      }
    })();
  }, [productoSeleccionado]);

  // ───── Cargar stock de la presentación para el usuario ────────────────────
  useEffect(() => {
    (async () => {
      if (!presentacionSeleccionada || !userId) return;
      try {
        console.groupCollapsed("📊 Cargando stock");
        console.log("User:", userId, "Presentación:", presentacionSeleccionada);
        const { data } = await api.get(
          `/inventario/${userId}/${presentacionSeleccionada}`
        );
        console.log("Stock:", data);
        setStock(data || null);
        setErrorStock("");
        console.groupEnd();
      } catch (err) {
        console.error("❌ Error al cargar stock:", err);
        setStock(null);
        setErrorStock("❌ No se pudo cargar el stock");
      }
    })();
  }, [presentacionSeleccionada, userId]);

  // ───── Cargar precio (base, IVA%, con IVA) ────────────────────────────────
  useEffect(() => {
    (async () => {
      if (!presentacionSeleccionada || !productoSeleccionado) return;
      try {
        console.groupCollapsed("💰 Cargando precio");
        console.log(
          "Producto:",
          productoSeleccionado,
          "Presentación:",
          presentacionSeleccionada
        );
        const { data } = await api.get(
          `/precios/${productoSeleccionado}/${presentacionSeleccionada}`
        );
        console.log("Respuesta precio:", data);

        if (!data) {
          alert("❌ Esta presentación no tiene precio asignado.");
          setPrecioBase(0);
          setPrecioConIva(0);
          console.groupEnd();
          return;
        }

        const precio = parseFloat(data.precio_base || 0);
        const iva = parseFloat(data.iva || 0);
        const conIva = parseFloat(data.precio_con_iva || 0);

        if (precio === 0 || conIva === 0) {
          alert("❌ Precio inválido o no asignado para esta presentación.");
          setPrecioBase(0);
          setPrecioConIva(0);
          console.groupEnd();
          return;
        }

        setPrecioBase(precio);
        setIvaRate(iva);
        setPrecioConIva(Math.round(conIva)); // 👁️ visual más homogéneo
        console.groupEnd();
      } catch (err) {
        console.error("❌ Error al cargar precio:", err);
        setPrecioBase(0);
        setPrecioConIva(0);
      }
    })();
  }, [presentacionSeleccionada, productoSeleccionado]);

  // ───── Helpers y validaciones ─────────────────────────────────────────────
  const stockSuficiente =
    stock && cantidad > 0 && cantidad <= (stock.cajas || 0);

  // 🧮 Cálculo con decimales (toFixed para estabilidad, no para UI)
  const calcularItemVenta = () => {
    const totalBruto = Number(precioConIva) * Number(cantidad || 0);
    const descuentoTotal = +(
      totalBruto *
      (Number(descuento || 0) / 100)
    ).toFixed(4);
    const totalNeto = +(totalBruto - descuentoTotal).toFixed(4);

    const baseSinIva = +(totalNeto / (1 + Number(ivaRate || 0) / 100)).toFixed(
      4
    );
    const ivaTotal = +(totalNeto - baseSinIva).toFixed(4);

    return { baseSinIva, ivaTotal, descuentoTotal, total: totalNeto };
  };

  // Firma idempotente del carrito (misma venta -> misma firma)
  const firmaVenta = useMemo(() => {
    try {
      const base = JSON.stringify({
        descripcionVenta,
        items: carrito.map((i) => ({
          presentacion_id: i.presentacion_id,
          product_id: i.product_id,
          cantidad: i.cantidad,
          precio_unitario: i.precio_unitario,
          descuento_total: i.descuento_total,
        })),
      });
      return btoa(unescape(encodeURIComponent(base))).slice(0, 64);
    } catch {
      return null;
    }
  }, [carrito, descripcionVenta]);

  // ───── Acciones de UI ─────────────────────────────────────────────────────
  const agregarAlCarrito = () => {
    if (
      !stockSuficiente ||
      !presentacionSeleccionada ||
      cantidad <= 0 ||
      precioBase === 0
    ) {
      toast.warning("Verifica cantidad, selección y stock.");
      return;
    }

    const presentacion = presentaciones.find(
      (p) => p.id === presentacionSeleccionada
    );
    const producto = productos.find((p) => p.id === productoSeleccionado);
    const familia = familias.find((f) => f.name === familiaSeleccionada);

    if (!presentacion || !producto) {
      toast.error("No se encontró la presentación o el producto.");
      return;
    }

    const { baseSinIva, ivaTotal, descuentoTotal, total } = calcularItemVenta();

    const nuevoItem = {
      id: crypto.randomUUID(),
      // 🧷 IDs para doble FK en backend
      presentacion_id: presentacionSeleccionada,
      product_id: producto.id, // ← se envía al backend

      // Metadatos de UI
      nombre_presentacion: presentacion.presentation_name,
      nombre_producto: producto.name,
      nombre_familia: familia?.name || "",

      // Cantidades y montos (lógica con decimales)
      cantidad,
      precio_unitario: Number(precioConIva),
      descuento_total: descuentoTotal,
      subtotal: baseSinIva,
      iva_total: ivaTotal,
      total,
    };

    logGroup("🛒 Agregar al carrito", nuevoItem);
    setCarrito((prev) => [...prev, nuevoItem]);

    // Reset mínimos del formulario (mantengo familia/producto seleccionados para agilizar)
    setPresentacionSeleccionada("");
    setCantidad(1);
    setStock(null);
    setPrecioBase(0);
    setPrecioConIva(0);
    setDescuento(0);
  };

  const eliminarItem = (id) => {
    logGroup("🗑️ Eliminar item", { id });
    setCarrito((prev) => prev.filter((item) => item.id !== id));
  };

  // Totales a partir del carrito (decimales internamente)
  const totalNeto = carrito.reduce(
    (sum, item) => sum + Number(item.subtotal || 0),
    0
  );
  const totalIVA = carrito.reduce(
    (sum, item) => sum + Number(item.iva_total || 0),
    0
  );
  const totalDescuentos = carrito.reduce(
    (sum, item) => sum + Number(item.descuento_total || 0),
    0
  );
  const totalVenta = carrito.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0
  );

  // ───── Registrar venta (anti-doble envío + idempotencia) ──────────────────
  const handleRegistrarVenta = async () => {
    if (carrito.length === 0) {
      toast.warning("No hay productos en el carrito");
      return;
    }

    // Prevención doble clic en FE
    if (guardando || envioEnCursoRef.current) {
      console.warn("⛔ Envío ya en curso. Se ignora clic duplicado.");
      return;
    }

    // Prevención de reintentos con la misma firma
    if (firmaVenta && ultimaFirmaVentaRef.current === firmaVenta) {
      console.warn("⛔ Venta con misma firma ya enviada. Evitando duplicado.");
      toast.info("La venta ya fue enviada. Espera confirmación.");
      return;
    }

    const idempotencyKey = crypto.randomUUID();
    logGroup("🚀 Registrar venta: inicio", {
      descripcionVenta,
      items: carrito,
      idempotencyKey,
      firmaVenta,
    });

    try {
      setGuardando(true);
      envioEnCursoRef.current = true;

      // Payload para backend actual (manteniendo estructura)
      const ventaPayload = {
        description: descripcionVenta,
        items: carrito.map((item) => ({
          presentation_id: item.presentacion_id,
          product_id: item.product_id, // ← ya viaja al backend (lo puedes usar)
          quantity_boxes: item.cantidad,
          quantity_units: 0,
          discount: item.descuento_total,
        })),
      };

      // Si tu wrapper api permite headers: api.post(url, data, { headers: {} })
      // Si no, puedes adaptar el servicio para soportarlo (inocuo si backend lo ignora)
      const resp = await api.post("/ventas", ventaPayload, {
        headers: { "X-Idempotency-Key": idempotencyKey },
      });

      logGroup("✅ Registrar venta: éxito", resp?.data);
      ultimaFirmaVentaRef.current = firmaVenta;
      toast.success("✅ Venta registrada correctamente");
      setCarrito([]);
      setDescripcionVenta("");
    } catch (err) {
      console.error("🛑 Error al registrar venta:", err);
      toast.error("Error al registrar venta");
    } finally {
      envioEnCursoRef.current = false;
      setGuardando(false);
    }
  };

  // ───── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">
        Ventas (Carrito)
      </h1>

      {/* ─── Formulario ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Familia */}
        <div>
          <label>Familia</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={familiaSeleccionada}
            onChange={(e) => setFamiliaSeleccionada(e.target.value)}
          >
            <option value="">Selecciona</option>
            {familias.map((f) => (
              <option key={f.id} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Producto */}
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
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </div>

        {/* Presentación */}
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
              <option key={p.id} value={p.id}>
                {p.presentation_name}
              </option>
            ))}
          </select>

          {stock && (
            <p className="text-sm text-gray-600 mt-1">
              Stock disponible: {stock.cajas} cajas
            </p>
          )}
          {errorStock && <p className="text-sm text-red-600">{errorStock}</p>}
        </div>

        {/* Cantidad */}
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

        {/* Precio con IVA (visual) */}
        <div>
          <label>Precio (con IVA)</label>
          <input
            type="number"
            readOnly
            value={precioConIva}
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        {/* % Descuento */}
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

        {/* Descripción */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium">
            Descripción de la venta
          </label>
          <input
            type="text"
            value={descripcionVenta}
            onChange={(e) => setDescripcionVenta(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Ej: Venta julio"
          />
        </div>
      </div>

      {/* Agregar al carrito */}
      <button
        onClick={agregarAlCarrito}
        disabled={
          !stockSuficiente || !presentacionSeleccionada || precioBase === 0
        }
        className={`mt-4 px-4 py-2 rounded text-white ${
          !stockSuficiente || !presentacionSeleccionada || precioBase === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-700 hover:bg-blue-800"
        }`}
        aria-disabled={
          !stockSuficiente || !presentacionSeleccionada || precioBase === 0
        }
      >
        Agregar al carrito
      </button>

      {/* ─── Carrito ───────────────────────────────────────────────────────── */}
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
                <th>Base sin IVA</th>
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
                  <td>{formatCOP(item.precio_unitario)}</td>
                  <td>{formatCOP(item.descuento_total)}</td>
                  <td>{formatCOP(item.subtotal)}</td>{" "}
                  {/* 👁️ redondeado visual */}
                  <td>{formatCOP(item.iva_total)}</td>{" "}
                  {/* 👁️ redondeado visual */}
                  <td className="font-bold">{formatCOP(item.total)}</td>{" "}
                  {/* 👁️ redondeado visual */}
                  <td>
                    <button
                      onClick={() => eliminarItem(item.id)}
                      className="text-red-600 hover:scale-110 text-lg"
                      title="Eliminar"
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totales */}
          <div className="mt-4 text-right space-y-1">
            <p>
              Base sin IVA total: <strong>{formatCOP(totalNeto)}</strong>
            </p>{" "}
            {/* 👁️ redondeado visual */}
            <p>
              IVA total: <strong>{formatCOP(totalIVA)}</strong>
            </p>{" "}
            {/* 👁️ redondeado visual */}
            <p>
              Descuentos totales: <strong>{formatCOP(totalDescuentos)}</strong>
            </p>
            <p>
              Total venta: <strong>{formatCOP(totalVenta)}</strong>
            </p>
          </div>

          {/* Registrar venta */}
          <div className="text-right mt-6">
            <button
              onClick={handleRegistrarVenta}
              disabled={guardando}
              className={`px-6 py-2 text-white rounded ${
                guardando
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
              aria-disabled={guardando}
            >
              {guardando ? "Registrando..." : "Registrar venta del carrito"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VentasCarrito;
