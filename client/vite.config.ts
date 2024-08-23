import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  // server: {
  //   proxy: {
  //     "/api": {
  //       // target: "http://localhost:8000",
  //       target: "https://chatty-server-production-1542.up.railway.app/",
  //       changeOrigin: true,
  //       secure: true,
  //     }
  //   }
  // },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [react()],
})
