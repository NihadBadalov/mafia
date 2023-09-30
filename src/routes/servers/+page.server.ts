import type { PageServerLoad } from "../$types";

export const load: PageServerLoad = (async ({ fetch }) => {
    const response = await fetch('/api/servers');
    const servers = await response.json();
    return servers;
});

