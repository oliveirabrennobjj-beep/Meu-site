import path from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";

// Script comum (sem type="module" e sem crossorigin): assim o index.html também abre
// direto do arquivo (file://), sem servidor, em vez de ficar com a tela em branco.
function scriptComum(): Plugin {
  return {
    name: "script-comum",
    apply: "build",
    enforce: "post",
    transformIndexHtml(html) {
      return html
        .replace(/<script type="module" crossorigin (src="[^"]+")><\/script>/g, "<script defer $1></script>")
        .replace(/ crossorigin(?=[ >])/g, "");
    },
  };
}

export default defineConfig({
  // caminhos relativos: o build funciona em qualquer subpasta (ex.: /bn-digital/dist/)
  base: "./",
  plugins: [react(), tailwindcss(), scriptComum()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    modulePreload: false,
  },
});
