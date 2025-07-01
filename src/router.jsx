// ✅ src/router.jsx – Versión 1.7 (01 jul 2025)
// Configura las rutas principales con soporte para:
// 🔐 Login público, 🧱 Layout con Sidebar, y rutas protegidas con token
// 🧩 Rutas activas: dashboard, movimientos, inventario, ventas

import { createBrowserRouter } from 'react-router-dom';
import Login from '@/pages/Login';                     
import Dashboard from '@/pages/Dashboard';             
import Movimientos from '@/pages/Movimientos';         
import Inventario from '@/pages/Inventario';           
import VentasCarrito from '@/pages/VentasCarrito';     // 🛒 Nuevo módulo

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
        path: 'inventario',
        element: <Inventario />,
      },
      {
        path: 'ventas', // 🛒 Nueva ruta protegida para registrar ventas
        element: <VentasCarrito />,
      },
    ],
  },
]);

export default router;
