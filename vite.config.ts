import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // ✅ Base path - важно для правильного разрешения путей
  base: './',
  
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    // Force Vite to always resolve 'three' to the same instance
    dedupe: ['three'],
    // ✅ Добавляем расширения для корректного разрешения модулей
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
      '@/app': path.resolve(__dirname, './src/app'),
      '@/components': path.resolve(__dirname, './src/app/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      // Fix for "Multiple instances of Three.js being imported" warning
      'three': path.resolve(__dirname, './node_modules/three'),
      // ✅ ДОБАВЛЕНО: Polyfill для Node.js модулей в браузере
      'process': 'process/browser',
      'buffer': 'buffer',
    },
  },
  // ✅ Optimized development settings
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'motion',
      '@splinetool/react-spline',
      '@splinetool/runtime',
      'three',
    ],
    exclude: [],
    // ✅ Force pre-bundling для стабильности
    force: false,
    // ✅ Эти зависимости должны быть prebundled
    esbuildOptions: {
      // Node.js global polyfills
      define: {
        global: 'globalThis',
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      },
    },
  },
  // 🚀 PRODUCTION BUILD OPTIMIZATION
  build: {
    // Target modern browsers for smaller bundle
    target: 'es2020',
    
    // ⚠️ FIGMA MAKE: Отключаем code splitting - не поддерживается
    cssCodeSplit: false,
    
    // ✅ Common JS для совместимости
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    
    // Rollup options
    rollupOptions: {
      output: {
        // ⚠️ FIGMA MAKE: Отключаем автоматическое разделение на чанки
        // Все в один бандл для совместимости с Figma Make
        inlineDynamicImports: true, // 🔥 Инлайним все динамические импорты
        
        // ✅ Используем относительные пути
        format: 'es',
        
        // Asset file naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(name)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.(woff2?|ttf|otf|eot)$/i.test(name)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          if (/\.css$/i.test(name)) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
      
      // Tree-shaking optimization
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
    },
    
    // Compression hints
    minify: 'esbuild',
    
    // Source maps только для production debugging (можно отключить)
    sourcemap: false,
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000, // 1MB warning threshold
    
    // Report compressed size
    reportCompressedSize: true,
  },
  
  // ✅ Development server settings
  server: {
    port: 5173,
    strictPort: false,
    fs: {
      strict: false, // Разрешаем доступ к файлам вне root
    },
  },
  
  // Preview server optimization
  preview: {
    port: 3000,
    strictPort: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
  
  // ✅ SSR Configuration - предотвращаем проблемы с динамическими импортами
  ssr: {
    noExternal: [
      '@splinetool/react-spline',
      '@splinetool/runtime',
      'three',
    ],
  },
})