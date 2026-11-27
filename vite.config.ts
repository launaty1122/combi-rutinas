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
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
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
        // Íconos provisionales (scripts/generar-iconos.mjs): se reemplazan por los de la mascota.
        icons: [
          { src: 'icono-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icono-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icono-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
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
