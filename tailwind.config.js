// tailwind.config.js
// ✅ tailwind.config.js – Actualizado para Tailwind v4 + soporte fuente Inter
import { defineConfig } from 'tailwindcss';

export default defineConfig({
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Permite usar font-sans sin errores
      },
    },
  },
  plugins: [],
});
