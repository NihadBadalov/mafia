import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { webSocketServer } from './webSocketPluginVite';
import mkcert from 'vite-plugin-mkcert';


export default defineConfig({
    server: {
        port: 3000,
        https: false,
    },
    preview: {
        port: 3000,
    },
    plugins: [
        sveltekit(),
        //mkcert(),
        webSocketServer,
    ],
});

