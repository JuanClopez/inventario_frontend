// ✅ src/router.jsx
// Configura las rutas principales de la app usando React Router DOM 6
// con soporte para rutas protegidas y estructura escalable

import { createBrowserRouter } from 'react-router-dom';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import PrivateRoute from '@/routes/PrivateRoute'; // Ruta protegida

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />, // 🔐 Página pública de inicio de sesión
  },
  {
    path: '/dashboard',
    element: (
      <PrivateRoute>
        <Dashboard /> {/* 🔒 Página protegida solo accesible con token */}
      </PrivateRoute>
    ),
  },
  // Aquí puedes agregar otras rutas protegidas más adelante:
  // {
  //   path: '/inventario',
  //   element: (
  //     <PrivateRoute>
  //       <Inventario />
  //     </PrivateRoute>
  //   ),
  // },
]);

export default router;
