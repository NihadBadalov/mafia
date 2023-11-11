import { h as handleUserSession } from "./index5.js";
const userSessionHandlerTimeout = /* @__PURE__ */ new Set();
const handle = async ({ event, resolve }) => {
  if (!userSessionHandlerTimeout.has(event.getClientAddress())) {
    userSessionHandlerTimeout.add(event.getClientAddress());
    await handleUserSession(event?.cookies, event?.fetch, event?.url?.href);
    setTimeout(
      () => userSessionHandlerTimeout.delete(event.getClientAddress()),
      1e4
    );
  }
  const response = await resolve(event);
  return response;
};
export {
  handle
};
