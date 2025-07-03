// ✅ src/router.jsx – Versión 1.8 (03 jul 2025)
// Configura las rutas principales con soporte para:
// 🔐 Login público, 🧱 Layout con Sidebar, y rutas protegidas con token
// 🧩 Rutas activas: dashboard, movimientos, inventario, ventas, precios

import { createBrowserRouter } from 'react-router-dom';

import Login from '@/pages/Login';                     
import Dashboard from '@/pages/Dashboard';             
import Movimientos from '@/pages/Movimientos';         
import Inventario from '@/pages/Inventario';           
import VentasCarrito from '@/pages/VentasCarrito';     
import PreciosPage from '@/pages/PreciosPage';         // 🆕 Nueva importación

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
        path: 'ventas', // 🛒 Módulo de ventas
        element: <VentasCarrito />,
      },
      {
        path: 'precios', // 🆕 Nueva ruta de precios
        element: <PreciosPage />,
      },
    ],
  },
]);

export default router;
