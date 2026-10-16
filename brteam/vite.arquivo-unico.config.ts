// Gera o site inteiro em um único arquivo HTML (dist-arquivo-unico/index.html),
// para mandar por WhatsApp ou abrir direto no celular sem servidor.
// As fotos de public/ são embutidas por scripts/embutir-imagens.mjs depois do build.
import path from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: { outDir: "dist-arquivo-unico", assetsInlineLimit: 100_000_000 },
});
