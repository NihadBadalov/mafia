import { sequence } from "@sveltejs/kit/hooks";
import * as Sentry from "@sentry/sveltekit";
import { handleUserSession } from "$lib/server";
import type { Handle, RequestEvent } from "@sveltejs/kit";
import { dev, building } from "$app/environment";
import { npm_package_version } from "$env/static/private";

const version = `${npm_package_version}-${building ? 'build' : dev ? 'dev' : 'prod'}`;

Sentry.init({
  dsn: "https://9e9a7567330280fefbe5e26a9f897547@o4506557974839296.ingest.sentry.io/4506557978181632",
  tracesSampleRate: 1,
  release: `mafia@${version}`,
})

const userSessionHandlerTimeout = new Set();

export const handle: Handle = sequence(Sentry.sentryHandle(), async ({ event, resolve }) => {
  if (!userSessionHandlerTimeout.has(event.getClientAddress())) {
    userSessionHandlerTimeout.add(event.getClientAddress());
    await handleUserSession(event?.cookies, event?.fetch, event?.url?.href);
    setTimeout(
      () => userSessionHandlerTimeout.delete(event.getClientAddress()),
      10_000
    );
  }

  const response = await resolve(event! as unknown as RequestEvent);
  return response;
})

export const handleError = Sentry.handleErrorWithSentry();
