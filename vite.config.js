import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: [
      'transcribe-hub-22.preview.emergentagent.com',
      '.preview.emergentagent.com',
      'localhost',
      '.local'
    ],
    hmr: {
      clientPort: 443,
      protocol: 'wss'
    }
  }
});
