// ✅ src/router.jsx – Versión 1.5 (28 jun 2025)
// Configura las rutas principales con soporte para:
// 🔐 Login público, 🧱 Layout con Sidebar, y rutas protegidas con token
// 🧩 Se agregó la ruta protegida /movimientos

import { createBrowserRouter } from 'react-router-dom';
import Login from '@/pages/Login';                     
import Dashboard from '@/pages/Dashboard';             
import Movimientos from '@/pages/Movimientos'; // ✅ Nuevo módulo
import PrivateRoute from '@/routes/PrivateRoute';      
import LayoutBase from '@/layouts/LayoutBase';         

const router = createBrowserRouter([
  {
    path: '/', // 🔓 Ruta pública: Login
    element: <Login />,
  },
  {
    path: '/', // 🔐 Ruta protegida: requiere token
    element: (
      <PrivateRoute>
        <LayoutBase /> {/* 🧱 Layout con Sidebar + Outlet */}
      </PrivateRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'movimientos', // ✅ Nueva ruta protegida
        element: <Movimientos />,
      },
      // Puedes seguir agregando:
      // { path: 'productos', element: <Productos /> },
      // { path: 'reportes', element: <Reportes /> },
    ],
  },
]);

export default router;
