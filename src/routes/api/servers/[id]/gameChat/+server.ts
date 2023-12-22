import { json, error, type RequestHandler } from '@sveltejs/kit';
import { _data } from '$api';
import { getIncludedRolesForGameAnnouncement, getUserByAst, getUserRoleInServer, hasCurseWords } from '$lib';
import type { GameServer } from '$types';
import { GameRoles } from '$types/GameRoles';
import { GameStates } from '$types/GameStates';
import { io } from '$lib/webSocketConnection';

function notifyBots(
  server: GameServer,
  messageContent: string,
  authorName: string,
  authorId: number,
  to: 2 | 1 | 0
) {
  const rolesToGetMentioned = getIncludedRolesForGameAnnouncement(
    to === 2
      ? 'all'
      : to === 1
        ? 'citizens'
        : 'mafia'
  );
  for (let i = 0; i < server.bots.length; i++) {
    const bot = server.bots[i];
    if (!rolesToGetMentioned.includes(bot.gameRole)) continue;
    bot.handleChat(server, messageContent, authorName, authorId);
  }
}

export const POST: RequestHandler = async ({ request, params }) => {
  let { message, userId, ast } = await request.json();
  let user = getUserByAst(ast);

  if (!message && !message?.trim()?.length)
    throw error(400, 'Message can not be empty');

  if (hasCurseWords(message))
    throw error(418, 'Message cannot contain curse words');

  if (!user || user?.id != userId)
    throw error(403, 'Not Authorized');

  if (!params?.id || isNaN(params?.id as any))
    throw error(404, 'Couldn\'t find the server');

  let serverId = +params?.id;
  let server = _data.servers.find(s => s.id === serverId) as GameServer;
  if (!server) throw error(404, 'Couldn\'t find the server');

  if (!server.players.find(pid => pid === user?.id))
    throw error(403, 'Not Authorized');

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
    io.emit('serverEvent', {
      message: 'playSound',
      soundName: 'beep',
      serverId: server?.id,
    });
    notifyBots(server, message, user.name, user.id, 2);

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
    server.mafiaChat.push({
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
    io.emit('serverEvent', {
      message: 'playSound',
      soundName: 'beep',
      serverId: server?.id,
    });
    notifyBots(server, message, user.name, user.id, 2);
  }
  else {
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
    io.emit('serverEvent', {
      message: 'playSound',
      soundName: 'beep',
      serverId: server?.id,
    });
    notifyBots(server, message, user.name, user.id, 0);
  }

  // updateServer(server?.id);

  // @ts-ignore
  return json({}, { statusCode: 200 });
}

