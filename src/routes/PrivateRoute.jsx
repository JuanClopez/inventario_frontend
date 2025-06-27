// ✅ src/routes/PrivateRoute.jsx – Ruta protegida con soporte a children
// Versión 1.2 – 27 jun 2025 – Renderiza correctamente el layout

import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  // 🔐 Si no hay token, redirige al login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // ✅ Si hay token, renderiza el contenido protegido (Layout + Outlet)
  return children;
};

export default PrivateRoute;
