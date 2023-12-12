import { json, error, type RequestHandler } from '@sveltejs/kit';
import { _data } from '$api';
import type { GameServer } from '$types';
import { createBotUsername, updateServer, updateServers } from '$lib';
import { setTimeout as wait } from 'timers/promises';
import { Citizen } from '$lib/server/ai/roles/citizens/Citizen';
import { io } from '$lib/webSocketConnection';

export const POST: RequestHandler = async ({ request, params, fetch }) => {
  let { origin } = await request.json();

  if (origin !== _data.serverPassphrase)
    throw error(403, 'Not Authorized');

  if (!params?.id || isNaN(params?.id as any))
    throw error(404, 'Couldn\'t find the server');

  let serverId = +params?.id;
  let server = _data.servers.find(s => s.id === serverId) as GameServer;
  if (!server) throw error(404, 'Couldn\'t find the server');

  if (!server.fillWithBots || (server.fillWithBots && server.players.length >= server.maxPlayerCount))
    throw error(403, 'Cannot fill the server with bots');

  while (server.players.length < server.maxPlayerCount) {
    const request = await fetch('/api/user', {
      method: 'POST',
      body: JSON.stringify({
        origin: _data.serverPassphrase,
        username: createBotUsername(),
        bot: true,
      }),
    }).catch(() => null);

    const { id, username } = await request?.json().catch(() => null);
    server.bots.push(new Citizen(id, username, serverId))
    server.players.push(id);

    updateServer(serverId, io);
    updateServers(io);

    await wait(500);
  }

  // @ts-ignore
  return json({}, { statusCode: 200 });
}

