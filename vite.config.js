// ✅ vite.config.js – Configuración Vite con Tailwind v4 y React
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // ✅ Plugin oficial de Tailwind para Vite
import path from 'path';

export default defineConfig({
  plugins: [
    react(),           // Soporte para React
    tailwindcss(),     // Tailwind integrado con Vite sin PostCSS externo
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // ✅ Importaciones absolutas desde src
    },
  },
});
