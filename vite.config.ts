import { defineConfig } from "vite";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // ✅ Base path - важно для правильного разрешения путей
  base: "./",

  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),

    // ✅ Resolve figma:asset/* imports during Vercel/Vite build
    {
      name: "resolve-figma-asset-protocol",
      enforce: "pre",
      resolveId(source) {
        if (source.startsWith("figma:asset/")) {
          const file = source.replace("figma:asset/", "");
          // Кладём хеш-ассеты сюда: /src/assets/<hash>.png
          return path.resolve(__dirname, "src/assets", file);
          // Если решишь хранить отдельно:
          // return path.resolve(__dirname, "src/figma-assets", file);
        }
        return null;
      },
    },
  ],

  resolve: {
    dedupe: ["three"],
    // ✅ Добавляем расширения для корректного разрешения модулей
    extensions: [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/app": path.resolve(__dirname, "./src/app"),
      "@/components": path.resolve(__dirname, "./src/app/components"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/assets": path.resolve(__dirname, "./src/assets"),
      "@/styles": path.resolve(__dirname, "./src/styles"),
      three: path.resolve(__dirname, "./node_modules/three"),

      // ✅ Polyfill aliases (если реально используются)
      process: "process/browser",
      buffer: "buffer",
    },
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "motion",
      "@splinetool/react-spline",
      "@splinetool/runtime",
      "three",
    ],
    exclude: [],
    force: false,
    esbuildOptions: {
      define: {
        global: "globalThis",
        "process.env.NODE_ENV": JSON.stringify(
          process.env.NODE_ENV || "production"
        ),
      },
    },
  },

  build: {
    target: "es2020",
    cssCodeSplit: false,

    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },

    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        format: "es",
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || "";
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(name)) {
            return "assets/images/[name]-[hash][extname]";
          }
          if (/\.(woff2?|ttf|otf|eot)$/i.test(name)) {
            return "assets/fonts/[name]-[hash][extname]";
          }
          if (/\.css$/i.test(name)) {
            return "assets/css/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
    },

    minify: "esbuild",
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: true,
  },

  server: {
    port: 5173,
    strictPort: false,
    fs: {
      strict: false,
    },
  },

  preview: {
    port: 3000,
    strictPort: true,
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  },

  ssr: {
    noExternal: ["@splinetool/react-spline", "@splinetool/runtime", "three"],
  },
});
