

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.1b720180.js","_app/immutable/chunks/scheduler.5d79c82b.js","_app/immutable/chunks/index.22729539.js"];
export const stylesheets = [];
export const fonts = [];
