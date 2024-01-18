import * as Sentry from "@sentry/sveltekit";
import { dev, building } from "$app/environment";

const npm_package_version = '0.4.10';
const version = `${npm_package_version}-${building ? 'build' : dev ? 'dev' : 'prod'}`;


// If you don't want to use Session Replay, remove the `Replay` integration, 
// `replaysSessionSampleRate` and `replaysOnErrorSampleRate` options.
Sentry.init({
  dsn: "https://9e9a7567330280fefbe5e26a9f897547@o4506557974839296.ingest.sentry.io/4506557978181632",
  tracesSampleRate: 1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [new Sentry.Replay()],
  release: `mafia@${version}`,
})

export const handleError = Sentry.handleErrorWithSentry();
