// ✅ vite.config.js — Configuración optimizada para Vite + TailwindCSS 4.1 + React (Versión 1.1 – 26 jun 2025)

import { defineConfig } from 'vite';                 // 🧠 Configuración base de Vite
import react from '@vitejs/plugin-react';            // ⚛️ Soporte para React y JSX
import tailwindcss from '@tailwindcss/vite';         // 🎨 Plugin oficial para Tailwind CSS (v4+ sin PostCSS)
import path from 'path';                             // 🗂️ Módulo para rutas absolutas (alias "@")

export default defineConfig({
  plugins: [
    react(),           // ✅ React + JSX + Fast Refresh
    tailwindcss(),     // ✅ TailwindCSS activado como plugin moderno
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // ✅ Alias para usar "@/components/..." en vez de rutas relativas largas
    },
  },
});
