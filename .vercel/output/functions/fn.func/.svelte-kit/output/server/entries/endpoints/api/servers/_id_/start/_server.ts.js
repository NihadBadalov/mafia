import { e as error, j as json } from "../../../../../../chunks/index.js";
import { _ as _data } from "../../../../../../chunks/index4.js";
import { g as getUserByAst, G as GameRoles, e as arrayShuffle, r as randomEnumValue } from "../../../../../../chunks/index3.js";
import { i as io } from "../../../../../../chunks/webSocketConnection.js";
const POST = async ({ request, params, fetch }) => {
  let { userId, ast } = await request.json();
  let user = getUserByAst(ast);
  if (user?.id != userId)
    throw error(403, "Not Authorized");
  if (!params?.id || isNaN(params?.id))
    throw error(404, "Couldn't find the server");
  let serverId = +params?.id;
  let server = _data.servers.find((s) => s.id === serverId);
  if (!server)
    throw error(404, "Couldn't find the server");
  if (server.players.length < 6)
    throw error(403, "Not Authorized");
  if (user?.id !== server.ownerId)
    throw error(403, "Not Authorized");
  let amountOfPlayersToAssign = server.players.length;
  const playersToAssign = {
    [GameRoles.Unknown]: 0,
    [GameRoles.Mafia]: server.mafiaCount >= 3 ? server.mafiaCount - 1 : server.mafiaCount,
    [GameRoles.Don]: +(server.mafiaCount >= 3),
    [GameRoles.Citizen]: 0,
    [GameRoles.Doctor]: 1,
    [GameRoles.Sheriff]: 1
  };
  playersToAssign[GameRoles.Citizen] = server.players.length - (playersToAssign[GameRoles.Mafia] + playersToAssign[GameRoles.Don] + playersToAssign[GameRoles.Doctor] + playersToAssign[GameRoles.Sheriff]);
  const playerIds = arrayShuffle([...server.players]);
  for (let i = 0; i < playerIds.length; i++) {
    let role = 0;
    while (amountOfPlayersToAssign !== 0 && !role) {
      let roleId = randomEnumValue(GameRoles);
      if (playersToAssign[roleId] == 0)
        continue;
      role = +roleId;
    }
    playersToAssign[role] -= 1;
    server.playerRoles = [...server.playerRoles, { userId: playerIds[i], role }];
  }
  server.initialPlayers = [...server.players];
  server.started = true;
  io.emit("serverEvent", {
    message: "playSound",
    soundName: "gong",
    serverId
  });
  io.emit("serverEvent", {
    message: "indexSocketsFromServer",
    serverId
  });
  fetch(`/api/servers/${server.id}/night`, {
    method: "POST",
    body: JSON.stringify({
      origin: _data.serverPassphrase,
      type: "first"
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });
  return json({}, { statusCode: 200 });
};
export {
  POST
};
