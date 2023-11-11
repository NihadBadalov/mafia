import { e as error, j as json } from "../../../../../../chunks/index.js";
import { _ as _data } from "../../../../../../chunks/index4.js";
import { g as getUserByAst, b as getUserRoleInServer, G as GameRoles } from "../../../../../../chunks/index3.js";
import { G as GameStates } from "../../../../../../chunks/GameStates.js";
import { i as io } from "../../../../../../chunks/webSocketConnection.js";
const POST = async ({ request, params }) => {
  let { message, userId, ast } = await request.json();
  let user = getUserByAst(ast);
  if (user?.id != userId)
    throw error(403, "Not Authorized");
  if (!params?.id || isNaN(params?.id))
    throw error(404, "Couldn't find the server");
  let serverId = +params?.id;
  let server = _data.servers.find((s) => s.id === serverId);
  if (!server)
    throw error(404, "Couldn't find the server");
  if (!server.players.find((pid) => pid === user?.id))
    throw error(403, "Not Authorized");
  if (!message && !message?.trim()?.length)
    throw error(400, "Message can not be empty");
  if (!server.playersCanChat)
    throw error(400, "Players can't chat at the moment");
  const userRole = getUserRoleInServer(userId);
  if (server.state === GameStates.Night && !(userRole === GameRoles.Mafia || userRole === GameRoles.Don))
    throw error(400, "Player can't chat at the moment");
  if (!server.started) {
    server.citizenChat.push({
      userId,
      content: message
    });
    server.mafiaChat.push({
      userId,
      content: message
    });
    io.emit("serverEvent", {
      message: "chatMessageFromServerToServer",
      to: 2,
      serverId: server?.id,
      userId,
      content: message
    });
    io.emit("serverEvent", {
      message: "playSound",
      soundName: "beep",
      serverId: server?.id
    });
    return json({}, { statusCode: 200 });
  }
  if (server.state === GameStates.Day) {
    server.citizenChat.push({
      userId,
      content: message
    });
    server.mafiaChat.push({
      userId,
      content: message
    });
    io.emit("serverEvent", {
      message: "chatMessageFromServerToServer",
      to: 1,
      serverId: server?.id,
      userId,
      content: message
    });
    io.emit("serverEvent", {
      message: "playSound",
      soundName: "beep",
      serverId: server?.id
    });
  } else {
    server.mafiaChat.push({
      userId,
      content: message
    });
    io.emit("serverEvent", {
      message: "chatMessageFromServerToServer",
      to: 0,
      serverId: server?.id,
      userId,
      content: message
    });
    io.emit("serverEvent", {
      message: "playSound",
      soundName: "beep",
      serverId: server?.id
    });
  }
  return json({}, { statusCode: 200 });
};
export {
  POST
};
