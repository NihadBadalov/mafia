import * as server from '../entries/pages/servers/_page.server.ts.js';

export const index = 8;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/servers/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/servers/+page.server.ts";
export const imports = ["_app/immutable/nodes/8.4cb185c8.js","_app/immutable/chunks/scheduler.5d79c82b.js","_app/immutable/chunks/index.22729539.js","_app/immutable/chunks/navigation.a9717524.js","_app/immutable/chunks/singletons.67eadd99.js","_app/immutable/chunks/ServerList.0aef4fc8.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/webSocketConnection.6166954d.js"];
export const stylesheets = [];
export const fonts = [];
