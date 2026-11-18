import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "https://placement-management-portal-4cvk.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
