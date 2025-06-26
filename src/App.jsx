// ✅ src/App.jsx
// App principal del frontend de inventario Probien
// Carga el componente <Login /> como vista inicial (puede cambiarse más adelante por routing)

// 🎨 Estilos globales definidos en index.css (Tailwind + estilos base)
import './index.css';

// 🧩 Página de inicio actual (Login)
import Login from './pages/Login';

function App() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      {/* 💻 Contenedor principal centrado con padding y sombra */}
      <section className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
        <Login />
      </section>
    </main>
  );
}

export default App;
