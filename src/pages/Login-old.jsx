import { useState } from 'react';
import api from '@/services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensaje('');

    try {
      const res = await api.post('/login', { email, password });
      const { token } = res.data;
      localStorage.setItem('token', token);
      window.location.reload();
    } catch (error) {
      const msg = error.response?.data?.mensaje || 'Error al iniciar sesión';
      setMensaje(msg);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-blue-600 text-center mb-2">
          Iniciar Sesión
        </h1>

        <p className="text-center text-gray-500 text-sm mb-6">
          Ingresa tus credenciales para continuar
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="usuario@ejemplo.com"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition-colors duration-200"
          >
            Ingresar
          </button>

          {mensaje && (
            <p className="text-sm text-center text-red-600">{mensaje}</p>
          )}
        </form>

        <p className="text-xs text-center text-gray-400 mt-6">
          © {new Date().getFullYear()} Sistema de Inventario Probien
        </p>
      </div>
    </main>
  );
};

export default Login;
