import { e as error, j as json } from "../../../../../../chunks/index.js";
import { _ as _data } from "../../../../../../chunks/index4.js";
import { i as io } from "../../../../../../chunks/webSocketConnection.js";
import { g as getUserByAst } from "../../../../../../chunks/index3.js";
function sendMessage(event, text, ep) {
  io.emit(event, { message: text, endpoint: ep });
}
const POST = async ({ request, params, url }) => {
  let { userId, ast } = await request.json();
  if (getUserByAst(ast)?.id != userId)
    throw error(403, "Not Authorized");
  if (!params?.id || isNaN(params?.id))
    throw error(404, "Couldn't find the server");
  let serverId = +params?.id;
  let server = _data.servers.find((s) => s.id === serverId);
  if (!server)
    throw error(404, "Couldn't find the server");
  if (_data.servers.find((s) => s.players.find((pid) => pid === userId)))
    throw error(400, "Player is already in a server");
  if (server.playerBlacklist.indexOf(userId) !== -1)
    throw error(400, "Player can not join - is a spectator");
  server.players.push(userId);
  sendMessage("serverEvent", "updateServers", url?.href);
  return json({}, { statusCode: 200 });
};
export {
  POST
};
