import { io } from '$lib/webSocketConnection.js';

export const load = (async ({ fetch }) => {
    /**
    io.on('serverEvent', async (message) => {
        // Message from server
        if (message !== 'updateServers') return;

        const response = await fetch('/api/servers');
        const servers = await response.json();
        console.log('yuppeee');
        return servers;
    });
    io.on('fallbackEvent', (message) => {
        sendMessage('fallbackEvent', message);
    });
    */

    const response = await fetch('/api/servers');
    const servers = await response.json();
    return servers;
});

