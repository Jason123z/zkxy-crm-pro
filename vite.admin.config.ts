import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import fs from 'fs';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'rename-admin-html',
        closeBundle() {
          const distPath = path.resolve(__dirname, 'dist-admin');
          if (fs.existsSync(path.join(distPath, 'admin.html'))) {
            fs.renameSync(
              path.join(distPath, 'admin.html'),
              path.join(distPath, 'index.html')
            );
          }
        }
      }
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist-admin',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'admin.html'),
        },
      },
    },
  };
});
