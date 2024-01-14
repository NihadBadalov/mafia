import { sentryVitePlugin } from "@sentry/vite-plugin";
import { sentrySvelteKit } from "@sentry/sveltekit";
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { webSocketServer } from './webSocketPluginVite';
import checker from 'vite-plugin-checker';

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
    sentrySvelteKit({
      sourceMapsUploadOptions: {
        org: "nihadbadalov",
        project: "javascript-sveltekit"
      }
    }),
    sveltekit(),
    webSocketServer,
    sentryVitePlugin({
      org: "nihadbadalov",
      project: "mafia"
    }),
    process.env.VITEST ? undefined : checker({
      typescript: true,
      eslint: {
        // for example, lint .ts and .tsx
        lintCommand: 'eslint "./src/**/*.{ts,tsx}" --ignore-pattern "/src/solid/*"'
      }
    })
  ],

  build: {
    sourcemap: true
  }
});
