import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/Rezerva_Validator_Modul_X-test/",
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    // Allow the sandboxed live-preview host (and any other host) in dev.
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-antd": ["antd", "@ant-design/icons"],
          "vendor-motion": ["framer-motion"],
          "vendor-charts": ["recharts"],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["antd", "@ant-design/icons", "framer-motion"],
  },
});
