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
      '/upload/': {
        target: process.env.VITE_API_BASE_URL,
        changeOrigin: true,
        secure: false,
      },
      '/predict/': {
        target: process.env.VITE_API_BASE_URL,
        changeOrigin: true,
        secure: false,
      },
      '/download/': {
        target: process.env.VITE_API_BASE_URL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 3000, // Increase the warning limit (in KB) as needed
  },
});
