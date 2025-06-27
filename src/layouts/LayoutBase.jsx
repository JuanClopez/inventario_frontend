// ✅ src/layouts/LayoutBase.jsx – Versión 1.1.1 (Temporal debug)
// Layout general con Sidebar reutilizable y área protegida <Outlet />

import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar'; // 🧩 Sidebar modular separado

const LayoutBase = () => {
  console.log('🧱 LayoutBase montado'); // 👈 Log temporal de depuración

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar /> {/* 🧱 Barra lateral de navegación */}
      <main className="flex-1 p-6 pl-0 lg:pl-64">
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutBase;
