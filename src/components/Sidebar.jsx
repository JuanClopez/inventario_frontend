// ✅ src/components/Sidebar.jsx – Versión 2.6 (03 jul 2025)
// 🛠️ Agrega opción "Precios" en menú para todos los usuarios
// ✅ Sidebar siempre visible en escritorio y deslizable en móvil
// ✅ Conserva diseño y políticas de visibilidad

import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  DocumentTextIcon,
  CubeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ArchiveBoxIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon, // 👈 Asegúrate que este icono esté disponible
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [perfil, setPerfil] = useState({
    first_name: '',
    last_name: '',
    avatar_url: '',
    role: '',
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData?.user) {
      const { first_name, last_name, avatar_url, role } = userData.user;
      setPerfil({ first_name, last_name, avatar_url, role });
    }
  }, []);

  return (
    <>
      {/* 📱 Botón hamburguesa en móvil */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          onClick={() => setOpen(!open)}
          className="p-2 text-white bg-blue-700 rounded-md shadow-lg"
        >
          {open ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </div>

      {/* 🧱 Sidebar general */}
      <aside
        className={`
          z-40 w-64 bg-blue-700 text-white flex flex-col p-6 transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          fixed top-0 left-0 h-screen lg:sticky lg:top-0 lg:translate-x-0 lg:flex lg:h-screen
        `}
      >
        {/* 👤 Perfil del usuario */}
        <div className="flex flex-col items-center mb-10 mt-10 lg:mt-0 text-center">
          {perfil.avatar_url ? (
            <img
              src={perfil.avatar_url}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
            />
          ) : (
            <div className="w-16 h-16 bg-white text-blue-700 flex items-center justify-center rounded-full text-xl font-bold shadow-md">
              {perfil.first_name?.[0] || 'U'}
            </div>
          )}
          <p className="mt-2 text-base font-semibold leading-5">
            {perfil.first_name} {perfil.last_name}
          </p>
          <p className="text-xs text-blue-100 mt-0.5 px-2">{perfil.role}</p>
        </div>

        {/* 📚 Navegación */}
        <nav className="space-y-2 flex-grow">
          <NavLink to="/dashboard" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors
             ${isActive ? 'bg-white text-blue-700' : 'text-white hover:bg-white hover:text-blue-700'}`
          }>
            <HomeIcon className="h-5 w-5" />
            Dashboard
          </NavLink>

          <NavLink to="/movimientos" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors
             ${isActive ? 'bg-white text-blue-700' : 'text-white hover:bg-white hover:text-blue-700'}`
          }>
            <DocumentTextIcon className="h-5 w-5" />
            Movimientos
          </NavLink>

          {perfil.role === 'admin' && (
            <NavLink to="/productos" className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors
               ${isActive ? 'bg-white text-blue-700' : 'text-white hover:bg-white hover:text-blue-700'}`
            }>
              <CubeIcon className="h-5 w-5" />
              Productos
            </NavLink>
          )}

          <NavLink to="/inventario" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors
             ${isActive ? 'bg-white text-blue-700' : 'text-white hover:bg-white hover:text-blue-700'}`
          }>
            <ArchiveBoxIcon className="h-5 w-5" />
            Inventario
          </NavLink>

          <NavLink to="/ventas" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors
             ${isActive ? 'bg-white text-blue-700' : 'text-white hover:bg-white hover:text-blue-700'}`
          }>
            <ShoppingCartIcon className="h-5 w-5" />
            Ventas
          </NavLink>

          {/* 🆕 Opción de Precios */}
          <NavLink to="/precios" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors
             ${isActive ? 'bg-white text-blue-700' : 'text-white hover:bg-white hover:text-blue-700'}`
          }>
            < CurrencyDollarIcon className="h-5 w-5" />
            Precios
          </NavLink>

          <NavLink to="/configuracion" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors
             ${isActive ? 'bg-white text-blue-700' : 'text-white hover:bg-white hover:text-blue-700'}`
          }>
            <Cog6ToothIcon className="h-5 w-5" />
            Configuración
          </NavLink>
        </nav>

        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/';
          }}
          className="mt-auto text-sm text-red-100 hover:text-white hover:underline"
        >
          Cerrar sesión
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
