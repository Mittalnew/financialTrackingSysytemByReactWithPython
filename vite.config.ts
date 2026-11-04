import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  // Keep port stable; bind IPv4 so http://127.0.0.1:5173 works (not only ::1)
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
})
