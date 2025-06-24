// ✅ src/App.jsx
// App principal que carga el Login directamente, útil para pruebas de estilos

import './index.css'; // Aseguramos que los estilos globales de Tailwind se carguen
import Login from './pages/Login';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <Login />
      </div>
    </div>
  );
}

export default App;

