import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Build estático para Cloudflare Pages: gera o SPA em dist/. A API roda como
// Pages Function (functions/[[path]].ts). Para rodar o full-stack localmente,
// use `npm run pages:dev` (wrangler pages dev).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5172,
    strictPort: true,
  },
});
