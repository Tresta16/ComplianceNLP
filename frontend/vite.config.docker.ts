import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API_PROXY_TARGET = "http://compliancenlp-serving:8080";
const PROXIED_API_PATHS = ["/api", "/health", "/ready", "/metrics", "/extract", "/analyze_gap"];
const apiProxyConfig = PROXIED_API_PATHS.reduce<Record<string, { target: string; changeOrigin: boolean }>>(
  (proxyConfig, path) => {
    proxyConfig[path] = {
      target: API_PROXY_TARGET,
      changeOrigin: true,
    };

    return proxyConfig;
  },
  {},
);

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 80,
    strictPort: true,
    proxy: apiProxyConfig,
  },
});
