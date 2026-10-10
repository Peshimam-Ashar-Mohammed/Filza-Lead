import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Filza-Lead/',
  plugins: [react()],
  server: {
    proxy: {
      '/api/google-places': {
        target: 'https://maps.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/google-places/, ''),
      },
    },
  },
});

