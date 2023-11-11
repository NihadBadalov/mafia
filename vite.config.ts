import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { webSocketServer } from './webSocketPluginVite';
import mkcert from 'vite-plugin-mkcert';


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

