// ✅ src/pages/Login.jsx – Versión 1.6 (29 jun 2025)
// 🔐 Mejora: Asegura carga completa del perfil (incluye role) y avatar genérico por defecto
// 📌 Estilo alineado a políticas internas de Probien

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensaje('');

    try {
      // 🔐 1. Solicitar autenticación y token
      const res = await api.post('/login', { email, password });
      const { token, user } = res.data;

      // 🧠 2. Obtener perfil extendido (nombre, apellido, avatar, rol)
      const perfilRes = await api.get('/usuarios/perfil', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("👤 Perfil cargado desde Supabase:", perfilRes.data);
      const perfil = perfilRes.data;

      // 🧱 3. Construir datos del usuario
      const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        perfil.first_name + ' ' + perfil.last_name
      )}&background=0D8ABC&color=fff`;

      const userData = {
        user: {
          id: user.id,
          email: user.email,
          first_name: perfil.first_name || '',
          last_name: perfil.last_name || '',
          role: perfil.role || 'Sin rol',
          avatar_url: perfil.avatar_url || avatarFallback
        },
        token
      };

      // 💾 4. Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(userData));

      // 🚀 5. Redirigir al Dashboard
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.mensaje || 'Error al iniciar sesión';
      setMensaje(msg);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-1">
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <button type="submit" className="w-full btn-base text-center">
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
