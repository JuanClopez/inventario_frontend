// ✅ src/pages/PreciosPage.jsx – Versión 2.7 (06 jul 2025)
// 🛠️ Se corrige carga de presentaciones incluso si ya tienen precio asignado
// ✅ Revisión de combinación lógica basada en product_id, no por nombre
// 📦 Alineado con backend Supabase y servicios actualizados

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  listarPreciosActivos,
  asignarPrecioProducto,
} from "../services/preciosService";
import api from "@/services/api";
import { obtenerPresentacionesPorProducto } from "@/services/presentacionesService";

// ─────────── COMPONENTES UI ───────────
const Table = ({ children }) => <table className="w-full border-collapse">{children}</table>;
const TableHeader = ({ children }) => <thead className="bg-blue-100 text-blue-700">{children}</thead>;
const TableBody = ({ children }) => <tbody>{children}</tbody>;
const TableRow = ({ children }) => <tr className="border-b hover:bg-blue-50">{children}</tr>;
const TableHead = ({ children, className = "" }) => (
  <th className={`p-2 text-center text-sm font-semibold ${className}`}>{children}</th>
);
const TableCell = ({ children, className = "" }) => (
  <td className={`p-2 text-sm ${className}`}>{children}</td>
);
const Button = ({ children, onClick, disabled, variant = "solid" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-3 py-1.5 rounded-md text-sm font-medium ${
      variant === "outline"
        ? "border border-blue-600 text-blue-600 hover:bg-blue-50"
        : "bg-blue-600 text-white hover:bg-blue-700"
    }`}
  >
    {children}
  </button>
);
const Dialog = ({ open, onOpenChange, children }) =>
  open ? (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  ) : null;
const DialogContent = ({ children }) => <div>{children}</div>;
const DialogTitle = ({ children }) => (
  <h2 className="text-xl font-semibold text-blue-700 mb-4">{children}</h2>
);
const Input = ({ value, onChange, ...props }) => (
  <input
    className="w-full p-2 border border-gray-300 rounded-md text-sm"
    value={value}
    onChange={onChange}
    {...props}
  />
);
const Switch = ({ checked, onCheckedChange }) => (
  <input
    type="checkbox"
    className="w-5 h-5 accent-blue-600"
    checked={checked}
    onChange={(e) => onCheckedChange(e.target.checked)}
  />
);

// ─────────── COMPONENTE PRINCIPAL ───────────
const PreciosPage = () => {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [presentaciones, setPresentaciones] = useState([]);
  const [presentacionSeleccionada, setPresentacionSeleccionada] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [precioFinal, setPrecioFinal] = useState("");
  const [aplicaIVA, setAplicaIVA] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const cargarDatos = async () => {
    try {
      const { productos: preciosActivos } = await listarPreciosActivos();

      const res = await api.get("/productos");
      const productosAll = res.data;

      const nuevos = productosAll.map((prod) => ({
        id: prod.id,
        nombre: prod.name,
        familia: prod.familia,
        base_price: null,
        iva_applicable: true,
        updated_at: null,
        presentacion: "",
      }));

      // ✅ Corrección: combinación basada en product_id, no en nombre
      const sinRepetir = nuevos.filter(
        (prod) =>
          !preciosActivos.some((p) => p.product_id === prod.id)
      );

      setProductos([...preciosActivos, ...sinRepetir]);
    } catch (error) {
      console.error("❌ Error al cargar datos:", error.message);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirModal = async (producto) => {
    setProductoSeleccionado(producto);
    setPrecioFinal("");
    setPresentacionSeleccionada("");
    setAplicaIVA(true);
    try {
      // ✅ Compatibilidad: si producto ya tiene precio, usa product_id; si no, usa id
      const pid = producto.product_id || producto.id;
      const presentaciones = await obtenerPresentacionesPorProducto(pid);
      setPresentaciones(presentaciones || []);
      setModalAbierto(true);
    } catch (err) {
      console.error("❌ Error al cargar presentaciones:", err.message);
    }
  };

  const guardarCambios = async () => {
    const valorFinal = parseFloat(precioFinal);
    const tienePresentacion = Boolean(presentacionSeleccionada);

    if (!productoSeleccionado || isNaN(valorFinal) || !tienePresentacion) return;

    try {
      setGuardando(true);

      const valorBase = aplicaIVA
        ? parseFloat((valorFinal / 1.19).toFixed(2))
        : parseFloat(valorFinal.toFixed(2));

      await asignarPrecioProducto({
        presentation_id: presentacionSeleccionada,
        price: valorBase,
        iva_rate: aplicaIVA ? 19 : 0,
      });

      setModalAbierto(false);
      await cargarDatos();
    } catch (error) {
      console.error("❌ Error al guardar precio:", error.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">
        💰 Gestión de Precios de Productos
      </h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Familia</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Presentación</TableHead>
            <TableHead className="text-right">Precio Base</TableHead>
            <TableHead>IVA</TableHead>
            <TableHead className="text-right">Precio Final</TableHead>
            <TableHead>Actualizado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productos.map((p) => {
            const base = p.base_price;
            const final = p.iva_applicable ? base * 1.19 : base;
            const [nombreProducto, nombrePresentacion] = p.nombre?.split(" – ") ?? [p.nombre, "—"];

            return (
              <TableRow key={p.id}>
                <TableCell>{p.familia}</TableCell>
                <TableCell>{nombreProducto}</TableCell>
                <TableCell className="whitespace-normal break-words max-w-[250px]">
                  {nombrePresentacion || "—"}
                </TableCell>
                <TableCell className="text-right">
                  {base !== null ? `$${Math.round(base)}` : "—"}
                </TableCell>
                <TableCell className="text-center">
                  {p.iva_applicable ? "Sí" : "No"}
                </TableCell>
                <TableCell className="text-right">
                  {base !== null ? `$${Math.round(final)}` : "—"}
                </TableCell>
                <TableCell className="text-center">
                  {p.updated_at
                    ? dayjs(p.updated_at).format("DD/MM/YYYY")
                    : "—"}
                </TableCell>
                <TableCell className="text-center">
                  <Button variant="outline" onClick={() => abrirModal(p)}>
                    Asignar precio
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent>
          <DialogTitle>Asignar precio a presentación</DialogTitle>
          <div className="flex flex-col gap-3 mt-2">
            <label className="text-sm font-medium">
              Seleccione presentación:
              <select
                className="w-full p-2 border border-gray-300 rounded-md text-sm mt-1"
                value={presentacionSeleccionada}
                onChange={(e) => setPresentacionSeleccionada(e.target.value)}
              >
                <option value="">Seleccionar</option>
                {presentaciones.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.presentation_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Precio final ($ COP) – incluye IVA:
              <Input
                type="number"
                value={precioFinal}
                onChange={(e) => setPrecioFinal(e.target.value)}
                min="0"
                step="1"
              />
            </label>
            <div className="flex items-center justify-between">
              <span className="text-sm">¿Aplica IVA (19%)?</span>
              <Switch checked={aplicaIVA} onCheckedChange={setAplicaIVA} />
            </div>
            <Button onClick={guardarCambios} disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PreciosPage;
