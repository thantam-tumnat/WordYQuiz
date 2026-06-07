import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// WordYQuiz 2.0 dev server
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
})
