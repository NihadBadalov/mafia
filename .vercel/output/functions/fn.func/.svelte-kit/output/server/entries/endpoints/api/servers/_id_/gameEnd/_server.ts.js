import { i as isMafiaGameRole, b as getUserRoleInServer, d as gameAnnounce } from "../../../../../../chunks/index3.js";
import { i as io } from "../../../../../../chunks/webSocketConnection.js";
import { _ as _data } from "../../../../../../chunks/index4.js";
import { G as GameStates } from "../../../../../../chunks/GameStates.js";
import { e as error, j as json } from "../../../../../../chunks/index.js";
import { setTimeout } from "timers/promises";
const POST = async ({ request, params }) => {
  let { origin } = await request.json();
  if (origin !== _data.serverPassphrase)
    throw error(403, "Not Authorized");
  if (!params?.id || isNaN(params?.id))
    throw error(404, "Couldn't find the server");
  let serverId = +params?.id;
  let server = _data.servers.find((s) => s.id === serverId);
  if (!server)
    throw error(404, "Couldn't find the server");
  if (!server.started)
    throw error(403, "Not Authorized");
  const endVotePlayerRoles = server.players.map((pid) => isMafiaGameRole(getUserRoleInServer(pid)));
  if (!(endVotePlayerRoles.filter((e) => e).length === 0 || endVotePlayerRoles.filter((e) => e).length >= endVotePlayerRoles.filter((e) => !e).length))
    throw error(403, "Not Authorized");
  server.state = GameStates.Ended;
  if (endVotePlayerRoles.filter((e) => e).length === 0) {
    await gameAnnounce(
      'CITIZENS <span class="color_red">WON!</span>',
      "all",
      serverId
    );
  } else {
    await gameAnnounce(
      'MAFIAS <span class="color_red">WON!</span>',
      "all",
      serverId
    );
  }
  await setTimeout(3e3);
  _data.servers = _data.servers.filter((s) => s.id !== serverId);
  io.emit("serverEvent", {
    message: "gameEndRedirect",
    serverId
  });
  return json({}, { statusCode: 200 });
};
export {
  POST
};
