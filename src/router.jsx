// ✅ src/router.jsx
// Configura las rutas de la app usando React Router

import { createBrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />, // Página de inicio (login)
  },
  {
    path: '/dashboard',
    element: <Dashboard />, // Página principal del usuario después de iniciar sesión
  }
]);

export default router;
