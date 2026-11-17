import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Build assets with root-relative URLs because Flask serves the app at /.
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
