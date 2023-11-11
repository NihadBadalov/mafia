import * as server from '../entries/pages/create/server/_page.server.ts.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/create/server/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/create/server/+page.server.ts";
export const imports = ["_app/immutable/nodes/5.cfff4c99.js","_app/immutable/chunks/scheduler.5d79c82b.js","_app/immutable/chunks/index.22729539.js","_app/immutable/chunks/navigation.a9717524.js","_app/immutable/chunks/singletons.67eadd99.js","_app/immutable/chunks/forms.655eae8e.js","_app/immutable/chunks/parse.bee59afc.js"];
export const stylesheets = [];
export const fonts = [];
