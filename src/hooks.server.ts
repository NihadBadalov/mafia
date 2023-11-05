import { handleUserSession } from "$lib/server";
import type { Handle, RequestEvent } from "@sveltejs/kit";

const userSessionHandlerTimeout = new Set();

export const handle: Handle = async ({ event, resolve }) => {
  if (!userSessionHandlerTimeout.has(event.getClientAddress())) {
    userSessionHandlerTimeout.add(event.getClientAddress());
    await handleUserSession(event?.cookies, event?.fetch, event?.url?.href);
  }

  const response = await resolve(event! as unknown as RequestEvent);
  return response;
}

