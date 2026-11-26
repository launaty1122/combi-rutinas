/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Configuración de Vite (la herramienta que arma la app).
// BASE: la ruta donde vivirá la app publicada. En GitHub Pages suele ser
// "/nombre-del-repositorio/". Se ajusta cuando publiquemos.
const BASE = process.env.BASE_PATH ?? '/'

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
    // Hace que la app sea instalable y funcione sin internet.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Combi Rutinas',
        short_name: 'Combi',
        description: 'Alacena, recetas y alimentación consciente.',
        lang: 'es',
        theme_color: '#165F47',
        background_color: '#165F47',
        display: 'standalone',
        orientation: 'portrait',
        start_url: BASE,
        scope: BASE,
        // Ícono provisional: se reemplaza por el de la mascota.
        icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'],
      },
    }),
  ],
  test: {
    environment: 'node',
    passWithNoTests: true,
  },
})
