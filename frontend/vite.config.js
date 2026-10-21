import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  /* Proxy /api and /uploads to the API the client is pointed at.
     VITE_API_URL is what src/services/api.js uses (see frontend/.env), so the
     proxy must honour it too — otherwise relative requests get sent to the
     hosted backend instead of the local one. */
  const API_TARGET =
    env.VITE_API_TARGET ||
    env.VITE_API_URL ||
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