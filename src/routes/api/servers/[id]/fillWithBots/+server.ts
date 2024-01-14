import { json, error, type RequestHandler } from '@sveltejs/kit';
import { _data, _generateUserToken } from '$api';
import { createBotUsername, updateServer, updateServers } from '$lib';
import { setTimeout as sleep } from 'timers/promises';
import { Citizen } from '$lib/server/ai/roles/citizens/Citizen';
import { io } from '$lib/webSocketConnection';

export const POST: RequestHandler = async ({ request, params, fetch, url }) => {
  const { origin } = await request.json();

  if (origin !== _data.serverPassphrase)
    throw error(403, 'Not Authorized');

  if (!params?.id || isNaN(params?.id as any))
    throw error(404, 'Couldn\'t find the server');

  const serverId = +params?.id;
  const server = _data.servers.find(s => s.id === serverId)!;
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
    const ast = _generateUserToken(64);

    _data?.userAsts?.push({
      id: id,
      token: ast,
    });
    server.bots.push(new Citizen(ast, id, username, serverId, url.origin));
    server.players.push(id);

    updateServer(serverId, io);
    updateServers(io);

    await sleep(500);
  }

  // @ts-expect-error Yeah
  return json({}, { statusCode: 200 });
}

