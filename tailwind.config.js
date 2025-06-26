// ✅ tailwind.config.js – Configuración para Tailwind 4.1 + fuente Inter (Versión 1.1 – 26 jun 2025)
import { defineConfig } from 'tailwindcss';

export default defineConfig({
  content: [
    './index.html',                  // 🧠 Escanea el HTML principal
    './src/**/*.{js,ts,jsx,tsx}',    // 🧠 Escanea todos los archivos React
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],  // 🎨 Fuente base definida como "font-sans"
      },
    },
  },
  plugins: [
    // 📌 Plugins opcionales para cuando se necesiten:
    // require('@tailwindcss/forms'),        // 📝 Mejora estilos de formularios
    // require('@tailwindcss/typography'),   // 📚 Para contenidos largos (blogs, docs)
  ],
});
