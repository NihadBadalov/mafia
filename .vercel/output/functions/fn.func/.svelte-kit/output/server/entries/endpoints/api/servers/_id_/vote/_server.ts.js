import { e as error, j as json } from "../../../../../../chunks/index.js";
import { _ as _data } from "../../../../../../chunks/index4.js";
import { g as getUserByAst, c as getUserById, a as getGameServerWithUserById, b as getUserRoleInServer, i as isMafiaGameRole, G as GameRoles } from "../../../../../../chunks/index3.js";
import { G as GameStates } from "../../../../../../chunks/GameStates.js";
const POST = async ({ request, params }) => {
  let { targetUserId, userId, ast } = await request.json();
  let user = getUserByAst(ast);
  let targetUser = getUserById(targetUserId);
  if (!user?.id)
    throw error(403, "Not Authorized");
  if (user?.id != userId)
    throw error(403, "Not Authorized");
  if (!targetUser)
    throw error(400, "Target user's ID is not valid");
  if (!params?.id || isNaN(params?.id))
    throw error(404, "Couldn't find the server");
  let serverId = +params?.id;
  let server = _data.servers.find((s) => s.id === serverId);
  if (!server)
    throw error(404, "Couldn't find the server");
  if (!server.players.find((pid) => pid === user?.id))
    throw error(403, "Not Authorized");
  if (getGameServerWithUserById(targetUserId)?.id !== serverId)
    throw error(400, "Target user is not in the server");
  if (server.whoCanVoteKick.indexOf(user.id) === -1)
    throw error(400, "Players can not vote-kick at the moment");
  if (server.votingBetween.indexOf(targetUser?.id) === -1)
    throw error(400, "Can not vote for kick for that player");
  let userRole = getUserRoleInServer(user?.id);
  let isMafiaUserRole = isMafiaGameRole(userRole);
  if (userRole === GameRoles.Unknown)
    throw error(400, "Can not vote as a spectator");
  if (server.state == GameStates.Day) {
    if (server.votes.citizens.find((kg) => kg.by === user?.id))
      throw error(403, "Not Authorized");
    server.votes.citizens.push({
      for: targetUserId,
      by: userId
    });
    server.whoCanVoteKick = server.whoCanVoteKick.filter((e) => e !== user?.id);
  } else {
    if (!isMafiaUserRole)
      throw error(403, "Not Authorized");
    if (userRole === GameRoles.Don && server.votes.don || server.votes.mafia.find((kg) => kg.by === user?.id))
      throw error(403, "Not Authorized");
    if (userRole === GameRoles.Don)
      server.votes.don = userId;
    else
      server.votes.mafia.push({
        for: targetUserId,
        by: userId
      });
    server.whoCanVoteKick = server.whoCanVoteKick.filter((e) => e !== user?.id);
  }
  return json({}, { statusCode: 200 });
};
export {
  POST
};
