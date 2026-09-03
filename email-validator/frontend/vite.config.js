import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/Rezerva_Validator_Modul_X-test/",
  plugins: [react(), tailwindcss()],
  define: {
    __HF_API_URL__: JSON.stringify(
      process.env.HF_API_URL || "https://sitcod3-bridge-modul-x-api.hf.space"
    ),
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
    proxy: {
      "/api": {
        target: process.env.HF_API_URL || "https://sitcod3-bridge-modul-x-api.hf.space",
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
