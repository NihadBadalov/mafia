import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { webSocketServer } from './webSocketPluginVite';

export default defineConfig({
  server: {
    port: 443,
    https: false,
  },
  plugins: [
    sveltekit(),
    //mkcert(),
    webSocketServer,
  ],
});

