import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/SolarCalc/" : "/",
  plugins: [react()],
  server: { port: 5178, proxy: { "/api": "http://localhost:4004" } },
});
