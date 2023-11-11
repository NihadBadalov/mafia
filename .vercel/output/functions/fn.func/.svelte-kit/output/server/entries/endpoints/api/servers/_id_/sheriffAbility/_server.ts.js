import { e as error, j as json } from "../../../../../../chunks/index.js";
import { _ as _data } from "../../../../../../chunks/index4.js";
import { g as getUserByAst, c as getUserById, b as getUserRoleInServer, G as GameRoles, d as gameAnnounce } from "../../../../../../chunks/index3.js";
import { setTimeout } from "timers/promises";
const POST = async ({ request, params }) => {
  let { targetUserId, userId, ast } = await request.json();
  let user = getUserByAst(ast);
  let targetUser = getUserById(targetUserId);
  if (!user?.id || user?.id != userId)
    throw error(403, "Not Authorized");
  if (!targetUser)
    throw error(400, "Target user's ID is not valid");
  if (!params?.id || isNaN(params?.id))
    throw error(404, "Couldn't find the server");
  let serverId = +params?.id;
  let server = _data.servers.find((s) => s.id === serverId);
  if (!server)
    throw error(404, "Couldn't find the server");
  if (!server.players.find((pid) => pid === user?.id) || !server.players.find((pid) => pid === targetUser?.id))
    throw error(403, "Not Authorized");
  if (!server.specialStates.sheriffAbility)
    throw error(403, "Sheriff cannot use his ability at the moment");
  let userRole = getUserRoleInServer(user?.id);
  if (userRole !== GameRoles.Sheriff)
    throw error(403, "Cannot view roles as not a Sheriff");
  const targetUserRole = getUserRoleInServer(targetUser?.id);
  if (!targetUserRole)
    throw error(403, "Couldn't fetch target user's role in the game server");
  if (!server.specialStates.sheriffAbility)
    return json({}, { statusCode: 200 });
  server.specialStates.sheriffAbility = false;
  await gameAnnounce(
    `${targetUser?.name}'S ROLE IS<br>${GameRoles["" + targetUserRole]}`,
    [GameRoles.Sheriff],
    serverId
  );
  await setTimeout(3e3);
  return json({}, { statusCode: 200 });
};
export {
  POST
};
