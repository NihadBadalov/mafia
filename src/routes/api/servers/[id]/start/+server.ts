import { json, error, type RequestHandler } from '@sveltejs/kit';
import { _data } from '$api';
import { arrayShuffle, getUserByAst, randomEnumValue } from '$lib';
import { GameRoles } from '$types/GameRoles';
import { io } from '$lib/webSocketConnection';
import { Mafia } from '$lib/server/ai/roles/mafia/Mafia';
import { Doctor } from '$lib/server/ai/roles/citizens/Doctor';
import { Sheriff } from '$lib/server/ai/roles/citizens/Sheriff';

export const POST: RequestHandler = async ({ request, params, fetch }) => {
  const { userId, ast } = await request.json();
  const user = getUserByAst(ast);

  if (user?.id != userId)
    throw error(403, 'Not Authorized');

  if (!params?.id || isNaN(params?.id as any))
    throw error(404, 'Couldn\'t find the server');

  const serverId = +params?.id;
  const server = _data.servers.find(s => s.id === serverId)!;
  if (!server) throw error(404, 'Couldn\'t find the server');

  // Check if appropriate player amount to start the server
  if (server.players.length < 6)
    throw error(403, 'Not Authorized');

  // Check if not the server owner
  if (user?.id !== server.ownerId)
    throw error(403, 'Not Authorized');


  // Player roles
  const amountOfPlayersToAssign = server.players.length;

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
      const roleId = randomEnumValue(GameRoles);
      if (playersToAssign[roleId] == 0) continue;

      role = +roleId;
    }

    playersToAssign[role as typeof GameRoles[keyof typeof GameRoles]] -= 1;
    server.playerRoles = [...server.playerRoles, { userId: playerIds[i], role: role }];

    // The user, whom we assigned the roles to, is a bot
    // Convert the bots' role from Citizen to the needed Role
    if (server.bots.find(b => b.userId === playerIds[i]) && role !== GameRoles.Citizen) {
      const removedCitizenBot = server.bots.splice(server.bots.findIndex(b => b.userId === playerIds[i]), 1)[0];

      switch (role) {
        case GameRoles.Mafia:
          server.bots.push(new Mafia(removedCitizenBot?.ast,
            playerIds[i],
            removedCitizenBot?.username,
            server?.id,
            removedCitizenBot.urlOrigin,
          ));
          break;

        case GameRoles.Don:
          server.bots.push(new Mafia(removedCitizenBot?.ast,
            playerIds[i],
            removedCitizenBot?.username,
            server?.id,
            removedCitizenBot.urlOrigin,
          ));
          break;

        case GameRoles.Doctor:
          server.bots.push(new Doctor(removedCitizenBot?.ast,
            playerIds[i],
            removedCitizenBot?.username,
            server?.id,
            removedCitizenBot.urlOrigin,
          ));
          break;

        case GameRoles.Sheriff:
          server.bots.push(new Sheriff(removedCitizenBot?.ast,
            playerIds[i],
            removedCitizenBot?.username,
            server?.id,
            removedCitizenBot.urlOrigin,
          ));
          break;

        default:
          break;
      }
    }
  }

  server.initialPlayers = [...server.players];
  server.started = true;

  io.emit('serverEvent', {
    message: 'playEffect',
    soundName: 'gong',
    serverId: serverId,
  });

  // Notify server that we have to index sockets through their roles
  // and add them to mafia/citizen their rooms
  io.emit('serverEvent', {
    message: 'indexSocketsFromServer',
    serverId: serverId,
  });


  fetch(`/api/servers/${server.id}/night`, {
    method: 'POST',
    body: JSON.stringify({
      origin: _data.serverPassphrase,
      type: 'first',
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  } as RequestInit);

  // @ts-expect-error Yeah
  return json({}, { statusCode: 200 });
}

