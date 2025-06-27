// ✅ src/components/Sidebar.jsx – Versión 1.8 (27 jun 2025)
// Sidebar fijo en PC y colapsable SOLO en móvil, corrige solapamiento y UX

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  DocumentTextIcon,
  CubeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { name: 'Dashboard', icon: HomeIcon, to: '/dashboard' },
  { name: 'Movimientos', icon: DocumentTextIcon, to: '/movimientos' },
  { name: 'Productos', icon: CubeIcon, to: '/productos' },
  { name: 'Reportes', icon: ChartBarIcon, to: '/reportes' },
  { name: 'Configuración', icon: Cog6ToothIcon, to: '/configuracion' },
];

const Sidebar = () => {
  const [open, setOpen] = useState(false); // Solo colapsa en móvil

  return (
    <>
      {/* 📱 Botón hamburguesa solo visible en móvil */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          onClick={() => setOpen(!open)}
          className="p-2 text-white bg-blue-700 rounded-md shadow-lg"
        >
          {open ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </div>

      {/* 🧱 Sidebar - fijo en PC, colapsable en móvil */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-blue-700 text-white flex flex-col p-6 transform transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:relative lg:flex`}
      >
        <div className="text-2xl font-bold mb-10 mt-10 lg:mt-0">Inventario Probien</div>

        <nav className="space-y-2 flex-grow">
          {navItems.map(({ name, icon: Icon, to }) => (
            <NavLink
              key={name}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors
                ${isActive ? 'bg-white text-blue-700' : 'text-white hover:bg-white hover:text-blue-700'}`
              }
            >
              <Icon className="h-5 w-5" />
              {name}
            </NavLink>
          ))}
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
