// ✅ src/pages/PreciosPage.jsx – Versión 1.9 (04 jul 2025)
// 📄 Corrige redondeo exacto del precio final y base, aplica IVA por defecto a nuevos productos
// 🔁 Soluciona problema de ocultamiento de productos sin precio luego de guardar

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  listarPreciosActivos,
  asignarPrecioProducto,
} from "../services/preciosService";
import api from "@/services/api";

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
  const [modalAbierto, setModalAbierto] = useState(false);
  const [precioFinal, setPrecioFinal] = useState("");
  const [aplicaIVA, setAplicaIVA] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const obtenerPrecios = async () => {
    try {
      const precios = await listarPreciosActivos();
      setProductos(precios || []);
    } catch (error) {
      console.error("❌ Error al cargar precios:", error.message);
    }
  };

  const actualizarListadoProductos = async () => {
    try {
      const res = await api.get("/productos");
      const nuevos = res.data.map((prod) => ({
        id: prod.id,
        nombre: prod.name,
        familia: prod.familia,
        base_price: null,
        iva_applicable: true, // ✅ Aplica IVA por defecto
        updated_at: null,
      }));
      setProductos((prev) => {
        const idsExistentes = new Set(prev.map((p) => p.id));
        const nuevosSinRepetir = nuevos.filter((p) => !idsExistentes.has(p.id));
        return [...prev, ...nuevosSinRepetir];
      });
    } catch (err) {
      console.error("❌ Error al cargar lista de productos:", err.message);
    }
  };

  useEffect(() => {
    obtenerPrecios();
    actualizarListadoProductos();
  }, []);

  const abrirModal = (producto) => {
    setProductoSeleccionado(producto);
    const base = parseFloat(producto.base_price || 0);
    const final = producto.iva_applicable ? base * 1.19 : base;
    setPrecioFinal(Math.round(final).toString());
    setAplicaIVA(producto.iva_applicable !== false);
    setModalAbierto(true);
  };

  const guardarCambios = async () => {
    if (!productoSeleccionado || !precioFinal) return;

    try {
      setGuardando(true);
      const valorFinal = parseFloat(precioFinal);
      const valorBase = aplicaIVA
        ? parseFloat((valorFinal / 1.19).toFixed(2))
        : parseFloat(valorFinal.toFixed(2));
      await asignarPrecioProducto({
        product_id: productoSeleccionado.id,
        price: valorBase,
        iva_rate: aplicaIVA ? 19 : 0,
      });
      setModalAbierto(false);
      await obtenerPrecios();                // ✅ Actualiza precios activos
      await actualizarListadoProductos();    // ✅ Vuelve a cargar todos los productos sin eliminar los vacíos
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
            return (
              <TableRow key={p.id}>
                <TableCell>{p.familia}</TableCell>
                <TableCell>{p.nombre}</TableCell>
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
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent>
          <DialogTitle>Asignar precio</DialogTitle>
          <div className="flex flex-col gap-3 mt-2">
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
