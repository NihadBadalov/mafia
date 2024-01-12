import { sentryVitePlugin } from "@sentry/vite-plugin";
import { sentrySvelteKit } from "@sentry/sveltekit";
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

  plugins: [sentrySvelteKit({
    sourceMapsUploadOptions: {
      org: "nihadbadalov",
      project: "javascript-sveltekit"
    }
  }), //mkcert(),
  sveltekit(), webSocketServer, sentryVitePlugin({
    org: "nihadbadalov",
    project: "mafia"
  })],

  build: {
    sourcemap: true
  }
});