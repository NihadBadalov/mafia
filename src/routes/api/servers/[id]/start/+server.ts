import { json, error, type RequestHandler } from '@sveltejs/kit';
import { _data } from '$api';
import { arrayShuffle, getUserByAst, randomEnumValue } from '$lib';
import type { GameServer } from '$types';
import { GameRoles } from '$types/GameRoles';
import { GameStates } from '$types/GameStates';
import { io } from '$lib/webSocketConnection';


export const POST: RequestHandler = async ({ request, params, fetch }) => {
  let { userId, ast } = await request.json();
  let user = getUserByAst(ast);

  if (user?.id != userId)
    throw error(403, 'Not Authorized');

  if (!params?.id || isNaN(params?.id as any))
    throw error(404, 'Couldn\'t find the server');

  let serverId = +params?.id;
  let server = _data.servers.find(s => s.id === serverId) as GameServer;
  if (!server) throw error(404, 'Couldn\'t find the server');

  // Check if appropriate player amount to start the server
  if (server.players.length < 6)
    throw error(403, 'Not Authorized');

  // Check if not the server owner
  if (user?.id !== server.ownerId)
    throw error(403, 'Not Authorized');


  // Player roles
  let amountOfPlayersToAssign = server.players.length;

  const playersToAssign: { [key in GameRoles]: any } = {
    [GameRoles.Unknown]: 0,
    [GameRoles.Mafia]: server.mafiaCount >= 3 ? server.mafiaCount - 1 : server.mafiaCount,
    [GameRoles.Don]: +(server.mafiaCount >= 3),

    [GameRoles.Citizen]: 0,
    [GameRoles.Doctor]: 1,
    [GameRoles.Sheriff]: 1,
  };
  playersToAssign[GameRoles.Citizen] = server.players.length - (
    playersToAssign[GameRoles.Mafia]
    + playersToAssign[GameRoles.Don]
    + playersToAssign[GameRoles.Doctor]
    + playersToAssign[GameRoles.Sheriff]
  );


  // Giving roles
  const playerIds = arrayShuffle([...server.players]);
  for (let i = 0; i < playerIds.length; i++) {
    let role: (0 | typeof GameRoles[keyof typeof GameRoles]) = 0;
    while (amountOfPlayersToAssign !== 0 && !role) {
      let roleId = randomEnumValue(GameRoles);
      if (playersToAssign[roleId] == 0) continue;

      role = +roleId;
    }

    playersToAssign[role as typeof GameRoles[keyof typeof GameRoles]] -= 1;
    server.playerRoles = [...server.playerRoles, { userId: playerIds[i], role: role }];
  }

  server.started = true;

  // Notify server that we have to index sockets through their roles
  // and add them to mafia/citizen their rooms
  io.emit('serverEvent', {
    message: 'indexSocketsFromServer',
    serverId: serverId,
  });

  fetch(`/api/servers/${server.id}/night`, {
    method: 'POST',
    body: JSON.stringify({
      origin: 'server',
      type: 'first',
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  } as RequestInit);

  // @ts-ignore
  return json({}, { statusCode: 200 });
}

