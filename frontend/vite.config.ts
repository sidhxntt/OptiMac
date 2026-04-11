import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  base: "/OptiMac/", // 👈 THIS is the key fix

  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    preserveSymlinks: true
  },
  build: {
    chunkSizeWarningLimit: 3000,
  },
})