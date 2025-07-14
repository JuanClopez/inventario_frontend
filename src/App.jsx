// ✅ src/App.jsx
// App principal del frontend de inventario Probien
// Carga el componente <Login /> como vista inicial (puede cambiarse más adelante por routing)

// 🎨 Estilos globales definidos en index.css (Tailwind + estilos base)
import './index.css';

// 🎉 Notificaciones emergentes (toast)
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 🧩 Página de inicio actual (Login)
import Login from './pages/Login';

function App() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      {/* 💻 Contenedor principal centrado con padding y sombra */}
      <section className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
        <Login />
      </section>

      {/* 📢 Contenedor de notificaciones toast */}
      <ToastContainer position="top-right" autoClose={3000} />
    </main>
  );
}

export default App;
