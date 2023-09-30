import { json, redirect } from '@sveltejs/kit';
import { arrayShuffle } from '$lib';

export const load = (async ({ fetch }) => {
    const response = await fetch('/api/servers')
    let servers = await response.json();
    if (!servers) return json({}, { status: 500 });

    servers = arrayShuffle(servers.servers.reverse());

    let randomServerId = 0;
    for (let i = 0; i < servers.length; i++) {
        if (servers[i].players.length < servers[i].maxPlayerCount) {
            randomServerId = servers[i].id;
            break;
        }
    }

    if (!randomServerId) {
        throw redirect(307, '/');
    }

    throw redirect(307, `/game/${randomServerId}`);
});

