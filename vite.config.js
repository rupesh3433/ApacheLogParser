import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Proxy endpoints to your backend
      '/upload': {
        target: 'https://apachelogparser-backend.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/download': {
        target: 'https://apachelogparser-backend.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/predict': {
        target: 'https://apachelogparser-backend.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 3000, // Increase the warning limit (in KB) as needed
  },
});
