import { json, error } from '@sveltejs/kit';
import { _data } from '$api';
import type { RequestHandler } from '@sveltejs/kit';
import { getUserByAst } from '$lib';
import { io } from '$lib/webSocketConnection.js';

// Send message to server
function sendMessage(event: string, text: string | object, ep: string) {
  io.emit(event, { message: text, endpoint: ep });
}

export const POST: RequestHandler = async ({ request, params, url }) => {
  let { userId, ast } = await request.json();

  if (getUserByAst(ast)?.id != userId)
    throw error(403, 'Not Authorized');

  if (!params?.id || isNaN(params?.id as any))
    throw error(404, 'Couldn\'t find the server');

  let serverId = +params?.id;
  let server = _data.servers.find(s => s.id === serverId);
  if (!server) throw error(404, 'Couldn\'t find the server');

  // Player in a server already
  if (!_data.servers.find(s => s.players.find(pid => pid === userId)))
    throw error(400, 'Player is not in the server');

  server.players.splice(server.players.indexOf(userId), 1);

  if (server.players.length === 0) {
    _data.servers.splice(_data.servers.indexOf(server), 1);
    sendMessage('serverEvent', 'updateServers', url?.href);
  }

  // @ts-ignore
  return json({}, { statusCode: 200 });
};

