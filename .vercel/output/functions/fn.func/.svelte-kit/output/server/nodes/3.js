import * as server from '../entries/pages/account/_page.server.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/account/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/account/+page.server.ts";
export const imports = ["_app/immutable/nodes/3.8e60f3e2.js","_app/immutable/chunks/scheduler.5d79c82b.js","_app/immutable/chunks/index.22729539.js","_app/immutable/chunks/navigation.a9717524.js","_app/immutable/chunks/singletons.67eadd99.js","_app/immutable/chunks/auth.3d14043c.js","_app/immutable/chunks/webSocketConnection.6166954d.js"];
export const stylesheets = [];
export const fonts = [];
