import * as server from '../entries/pages/game/_id_/_page.server.ts.js';

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/game/_id_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/game/[id]/+page.server.ts";
export const imports = ["_app/immutable/nodes/6.e3a52b8f.js","_app/immutable/chunks/scheduler.5d79c82b.js","_app/immutable/chunks/index.22729539.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/webSocketConnection.6166954d.js","_app/immutable/chunks/navigation.5f9acbba.js","_app/immutable/chunks/singletons.a37cd152.js","_app/immutable/chunks/auth.2bd09ea2.js"];
export const stylesheets = [];
export const fonts = [];
