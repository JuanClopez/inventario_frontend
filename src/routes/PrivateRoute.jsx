// ✅ src/routes/PrivateRoute.jsx
// Ruta protegida que verifica si el usuario tiene token válido

import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  // Si NO hay token => redirige al Login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Si hay token => muestra la ruta protegida
  return children;
};

export default PrivateRoute;
