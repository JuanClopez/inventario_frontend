// ✅ src/main.jsx
// Punto de entrada de la app. Aquí conectamos React con el DOM
// y usamos RouterProvider para manejar las rutas de la app

import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import router from './router'; // Rutas centralizadas
import './index.css'; // Estilos globales (Tailwind y estilos base)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
