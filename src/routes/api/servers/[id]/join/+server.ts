import { json, error, type RequestHandler } from '@sveltejs/kit';
import { _data } from '$api';
import { io } from '$lib/webSocketConnection.js';
import { getUserByAst } from '$lib';
import { adminAuth } from '$lib/firebase/firebase.admin';

// Send message to server
function sendMessage(event: string, text: string | object, ep: string) {
  io.emit(event, { message: text, endpoint: ep });
}

export const POST: RequestHandler = async ({ request, params, url }) => {
  let { userId, ast, fbs } = await request.json();

  if (getUserByAst(ast)?.id != userId)
    throw error(403, 'Not Authorized');

  if (!fbs)
    throw error(403, 'Not Authorized');

  // Check if the Firebase user exists
  const firebaseUserId = fbs ? await adminAuth.verifyIdToken(fbs as string)
    .then((user) => user.uid)
    .catch(() => null) : null;

  if (!firebaseUserId)
    throw error(403, 'Not Authorized');

  if (!params?.id || isNaN(params?.id as any))
    throw error(404, 'Couldn\'t find the server');

  let serverId = +params?.id;
  let server = _data.servers.find(s => s.id === serverId);
  if (!server) throw error(404, 'Couldn\'t find the server');

  // Player in a server already
  if (_data.servers.find(s => s.players.find(pid => pid === userId)))
    throw error(400, 'Player is already in a server');

  if (server.started)
    throw error(403, 'Cannot join - server is already started');

  if (server.playerBlacklist.indexOf(userId) !== -1)
    throw error(400, 'Player can not join - is a spectator');

  server.players.push(userId);

  // Update servers to show correct player count
  sendMessage('serverEvent', 'updateServers', url?.href);

  // @ts-ignore
  return json({}, { statusCode: 200 });
}

