// ✅ Ruta: src/pages/PreciosPage.jsx – Versión 1.3 (03 jul 2025)
// 📄 Página: PreciosPage – Gestión de precios de productos
// 🔧 Reemplazados los componentes de UI importados por versiones locales
// 🆘 Soluciona errores de Vite por rutas no encontradas

import { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import dayjs from "dayjs";

// ─────────────── COMPONENTES TEMPORALES DE UI ───────────────

// 📦 Tabla local temporal
const Table = ({ children }) => (
  <table className="w-full border-collapse">{children}</table>
);
const TableHeader = ({ children }) => (
  <thead className="bg-blue-100 text-blue-700">{children}</thead>
);
const TableBody = ({ children }) => <tbody>{children}</tbody>;
const TableRow = ({ children }) => (
  <tr className="border-b hover:bg-blue-50">{children}</tr>
);
const TableHead = ({ children, className = "" }) => (
  <th className={`p-2 text-left text-sm font-semibold ${className}`}>{children}</th>
);
const TableCell = ({ children, className = "" }) => (
  <td className={`p-2 text-sm ${className}`}>{children}</td>
);

// 🔘 Botón local
const Button = ({ children, onClick, disabled, variant = "solid", size = "base" }) => (
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

// 💬 Dialog modal simple
const Dialog = ({ open, onOpenChange, children }) =>
  open ? (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
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

// ✏️ Input local
const Input = ({ value, onChange, ...props }) => (
  <input
    className="w-full p-2 border border-gray-300 rounded-md text-sm"
    value={value}
    onChange={onChange}
    {...props}
  />
);

// 🔘 Switch local (checkbox)
const Switch = ({ checked, onCheckedChange }) => (
  <input
    type="checkbox"
    className="w-5 h-5 accent-blue-600"
    checked={checked}
    onChange={(e) => onCheckedChange(e.target.checked)}
  />
);

// ─────────────── COMPONENTE PRINCIPAL ───────────────

const PreciosPage = () => {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [nuevoIVA, setNuevoIVA] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const obtenerPrecios = async () => {
    try {
      const { data } = await axiosInstance.get("/precios");
      setProductos(data.productos || []);
    } catch (error) {
      console.error("❌ Error al cargar precios:", error.message);
    }
  };

  useEffect(() => {
    obtenerPrecios();
  }, []);

  const abrirModal = (producto) => {
    setProductoSeleccionado(producto);
    setNuevoPrecio(producto.base_price || "");
    setNuevoIVA(producto.iva_applicable || false);
    setModalAbierto(true);
  };

  const guardarCambios = async () => {
    if (!productoSeleccionado) return;

    try {
      setGuardando(true);
      await axiosInstance.post("/precios", {
        product_id: productoSeleccionado.id,
        base_price: parseFloat(nuevoPrecio),
        iva_applicable: nuevoIVA,
      });
      setModalAbierto(false);
      obtenerPrecios();
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
            <TableHead className="text-center">IVA</TableHead>
            <TableHead className="text-right">Precio Neto</TableHead>
            <TableHead className="text-center">Modificado</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productos.map((p) => {
            const precioNeto = p.iva_applicable
              ? p.base_price * 1.19
              : p.base_price;
            return (
              <TableRow key={p.id}>
                <TableCell>{p.familia}</TableCell>
                <TableCell>{p.nombre}</TableCell>
                <TableCell className="text-right">
                  ${p.base_price?.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  {p.iva_applicable ? "Sí" : "No"}
                </TableCell>
                <TableCell className="text-right">
                  ${precioNeto.toFixed(2)}
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
          <DialogTitle>Editar precio</DialogTitle>
          <div className="flex flex-col gap-3 mt-2">
            <label className="text-sm font-medium">
              Precio Base ($ COP):
              <Input
                type="number"
                value={nuevoPrecio}
                onChange={(e) => setNuevoPrecio(e.target.value)}
                min="0"
                step="0.01"
              />
            </label>
            <div className="flex items-center justify-between">
              <span className="text-sm">¿Aplica IVA (19%)?</span>
              <Switch checked={nuevoIVA} onCheckedChange={setNuevoIVA} />
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
