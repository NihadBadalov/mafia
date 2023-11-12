import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { webSocketServer } from './webSocketPluginVite';

export default defineConfig({
  server: {
    origin: 'https://www.themafia.xyz',
    host: 'localhost',
    port: 3000,
    https: false,
    // port: 443,
    // https: false,
  },
  plugins: [
    sveltekit(),
    //mkcert(),
    webSocketServer,
  ],
});

