import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:8080",
      "/health": "http://127.0.0.1:8080",
      "/ready": "http://127.0.0.1:8080",
      "/metrics": "http://127.0.0.1:8080",
      "/extract": "http://127.0.0.1:8080",
      "/analyze_gap": "http://127.0.0.1:8080"
    }
  }
});
