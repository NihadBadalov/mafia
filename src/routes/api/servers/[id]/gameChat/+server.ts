import { json, error, type RequestHandler } from '@sveltejs/kit';
import { _data } from '$api';
import { getUserByAst, getUserRoleInServer } from '$lib';
import type { GameServer } from '$types';
import { GameRoles } from '$types/GameRoles';
import { GameStates } from '$types/GameStates';
import { io } from '$lib/webSocketConnection';

export const POST: RequestHandler = async ({ request, params }) => {
  let { message, userId, ast } = await request.json();
  let user = getUserByAst(ast);

  if (user?.id != userId)
    throw error(403, 'Not Authorized');

  if (!params?.id || isNaN(params?.id as any))
    throw error(404, 'Couldn\'t find the server');

  let serverId = +params?.id;
  let server = _data.servers.find(s => s.id === serverId) as GameServer;
  if (!server) throw error(404, 'Couldn\'t find the server');

  if (!server.players.find(pid => pid === user?.id))
    throw error(403, 'Not Authorized');

  if (!message && !message?.trim()?.length)
    throw error(400, 'Message can not be empty');

  if (!server.playersCanChat)
    throw error(400, 'Players can\'t chat at the moment');

  const userRole = getUserRoleInServer(userId);
  if (server.state === GameStates.Night
    && !(userRole === GameRoles.Mafia || userRole === GameRoles.Don))
    throw error(400, 'Player can\'t chat at the moment');


  // Server not started yet
  if (!server.started) {
    server.citizenChat.push({
      userId: userId,
      content: message,
    });
    server.mafiaChat.push({
      userId: userId,
      content: message,
    });

    io.emit('serverEvent', {
      message: 'chatMessageFromServerToServer',
      to: 2,
      serverId: server?.id,
      userId: userId,
      content: message,
    });

    // updateServer(server?.id);

    // @ts-ignore
    return json({}, { statusCode: 200 });
  }

  // Server started
  if (server.state === GameStates.Day) {
    server.citizenChat.push({
      userId: userId,
      content: message,
    });
    io.emit('serverEvent', {
      message: 'chatMessageFromServerToServer',
      to: 1,
      serverId: server?.id,
      userId: userId,
      content: message,
    });
  }
  server.mafiaChat.push({
    userId: userId,
    content: message,
  });
  io.emit('serverEvent', {
    message: 'chatMessageFromServerToServer',
    to: 0,
    serverId: server?.id,
    userId: userId,
    content: message,
  });

  // updateServer(server?.id);

  // @ts-ignore
  return json({}, { statusCode: 200 });
}

