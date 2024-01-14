import { json, error } from '@sveltejs/kit';
import { _data } from '$api';
import type { RequestHandler } from '@sveltejs/kit';
import { getUserByAst, updateServer } from '$lib';
import { io } from '$lib/webSocketConnection.js';
import type { BaseRoleDerivative } from '$lib/server/ai/roles/BaseRole';
import type { Citizen } from '$lib/server/ai/roles/citizens/Citizen';

// Send message to server
function sendMessage(event: string, text: string | object, ep: string) {
  io.emit(event, { message: text, endpoint: ep });
}

export const POST: RequestHandler = async ({ request, params, url, fetch }) => {
  const { userId, ast } = await request.json();

  if (getUserByAst(ast)?.id != userId)
    throw error(403, 'Not Authorized');

  if (!params?.id || isNaN(params?.id as any))
    throw error(404, 'Couldn\'t find the server');

  const serverId = +params?.id;
  const server = _data.servers.find(s => s.id === serverId);
  if (!server) throw error(404, 'Couldn\'t find the server');

  // Player isn't in the server
  if (!server.players.find(s => s === Number(userId)))
    throw error(400, 'Player is not in the server');

  server.players.splice(server.players.indexOf(userId), 1);

  if (server.players.length - server.bots.length === 0) {
    _data.servers.splice(_data.servers.indexOf(server), 1);
    sendMessage('serverEvent', 'updateServers', url?.href);
  }
  else {
    // Fill the server with bots if we have free space
    if (server.fillWithBots
      && server.players.length < server.maxPlayerCount) {
      fetch(`/api/servers/${serverId}/fillWithBots`, {
        method: 'POST',
        body: JSON.stringify({
          origin: _data.serverPassphrase
        }),
      });
    }

    // Find a new owner if the owner left
    if (userId === Number(userId)) {
      const serverBotUserIds = server.bots.map(b => (b as BaseRoleDerivative<Citizen>).userId);
      server.ownerId = server.players.filter(
        p => serverBotUserIds.indexOf(p) === -1
      )[0]!;
    }
    updateServer(serverId, io);
  }


  // @ts-expect-error Yeah
  return json({}, { statusCode: 200 });
};

