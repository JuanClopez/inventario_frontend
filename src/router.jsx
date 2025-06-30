// ✅ src/router.jsx – Versión 1.6 (29 jun 2025)
// Configura las rutas principales con soporte para:
// 🔐 Login público, 🧱 Layout con Sidebar, y rutas protegidas con token
// 🧩 Rutas activas: dashboard, movimientos, inventario

import { createBrowserRouter } from 'react-router-dom';
import Login from '@/pages/Login';                     
import Dashboard from '@/pages/Dashboard';             
import Movimientos from '@/pages/Movimientos';         
import Inventario from '@/pages/Inventario'; // ✅ Nuevo módulo
import PrivateRoute from '@/routes/PrivateRoute';      
import LayoutBase from '@/layouts/LayoutBase';         

const router = createBrowserRouter([
  {
    path: '/', // 🔓 Ruta pública: Login
    element: <Login />,
  },
  {
    path: '/', // 🔐 Rutas protegidas
    element: (
      <PrivateRoute>
        <LayoutBase />
      </PrivateRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'movimientos',
        element: <Movimientos />,
      },
      {
        path: 'inventario', // ✅ Ruta nueva protegida
        element: <Inventario />,
      },
    ],
  },
]);

export default router;
