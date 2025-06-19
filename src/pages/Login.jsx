// ✅ src/pages/Login.jsx
// Página de Login con autenticación por JWT y conexión a backend

import { useState } from 'react';
import api from '@/services/api';

const Login = () => {
  // 🧠 Estado para formulario y errores
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  // 🟢 Acción al enviar el formulario
  const handleLogin = async (e) => {
    e.preventDefault();
    setMensaje('');

    try {
      const res = await api.post('/login', { email, password });
      const { token } = res.data;

      // 💾 Guardar el token en localStorage
      localStorage.setItem('token', token);

      // 🔁 Redirigir (temporal: recarga la página, luego usaremos react-router)
      window.location.reload();
    } catch (error) {
      // ❌ Error en login
      const msg = error.response?.data?.mensaje || 'Error al iniciar sesión';
      setMensaje(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Iniciar Sesión</h2>

        {/* Input: Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Correo</label>
          <input
            type="email"
            className="mt-1 block w-full border border-gray-300 rounded p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Input: Contraseña */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            type="password"
            className="mt-1 block w-full border border-gray-300 rounded p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Botón */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Ingresar
        </button>

        {/* Mensaje de error */}
        {mensaje && (
          <div className="text-red-600 text-center text-sm">{mensaje}</div>
        )}
      </form>
    </div>
  );
};

export default Login;
