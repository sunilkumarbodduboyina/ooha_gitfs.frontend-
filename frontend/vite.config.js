import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const API_TARGET =
    env.VITE_API_TARGET ||
    'https://ooha-gifts-backend.onrender.com';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: API_TARGET,
          changeOrigin: true,
        },
        '/uploads': {
          target: API_TARGET,
          changeOrigin: true,
        },
      },
    },
  };
});