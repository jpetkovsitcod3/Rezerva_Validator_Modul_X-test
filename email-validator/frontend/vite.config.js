import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/",
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
          "vendor-motion": ["framer-motion"],
        },
      },
    },
    // Enable minification and tree shaking
    minify: "esbuild",
  },
  optimizeDeps: {
    include: ["framer-motion"],
  },
});
