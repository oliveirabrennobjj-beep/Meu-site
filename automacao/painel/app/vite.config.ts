import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// O painel é publicado como um Artifact: um trecho de HTML com CSS e JS embutidos.
// React vem do cdnjs (global `React`/`ReactDOM`), por isso fica fora do pacote.
export default defineConfig({
  plugins: [tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  esbuild: { jsx: "transform", jsxInject: `import * as React from "react"` },
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    cssCodeSplit: false,
    lib: {
      entry: path.resolve(__dirname, "src/main.tsx"),
      formats: ["iife"],
      name: "PainelVendas",
      fileName: () => "painel.js",
      cssFileName: "painel",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react-dom/client"],
      output: {
        globals: { react: "React", "react-dom": "ReactDOM", "react-dom/client": "ReactDOM" },
      },
    },
  },
});
