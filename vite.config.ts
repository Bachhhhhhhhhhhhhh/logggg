import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/logggg/' : '/',
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['react-force-graph-2d', 'react-force-graph-3d', 'three', 'three-spritetext'],
  },
})
