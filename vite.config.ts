import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // relative asset paths so the build works from any subpath
  // (e.g. GitHub Pages project sites like /YOMI/), not just the domain root.
  base: "./",
})
