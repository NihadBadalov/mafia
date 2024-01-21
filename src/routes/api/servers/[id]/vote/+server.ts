import { json, error, type RequestHandler } from '@sveltejs/kit';
import { _data } from '$api';
import { getGameServerWithUserById, getUserByAst, getUserById, getUserRoleInServer, isMafiaGameRole } from '$lib';
import { GameStates } from '$types/GameStates';
import { GameRoles } from '$types/GameRoles';


export const POST: RequestHandler = async ({ request, params }) => {
  const { targetUserId, userId, ast } = await request.json();
  const user = getUserByAst(ast);
  const targetUser = getUserById(targetUserId);

  if (!user?.id)
    throw error(403, 'Not Authorized');
  if (user?.id != userId)
    throw error(403, 'Not Authorized');
  if (!targetUser)
    throw error(400, 'Target user\'s ID is not valid');

  if (!params?.id || isNaN(params?.id as any))
    throw error(404, 'Couldn\'t find the server');

  const serverId = +params?.id;
  const server = _data.servers.find(s => s.id === serverId)!;
  if (!server) throw error(404, 'Couldn\'t find the server');

  // Check if users are in the server
  if (!server.players.find(pid => pid === user?.id))
    throw error(403, 'Not Authorized');

  if (getGameServerWithUserById(targetUserId)?.id !== serverId)
    throw error(400, 'Target user is not in the server');

  if (server.whoCanVoteKick.indexOf(user.id) === -1)
    throw error(400, 'Players can not vote-kick at the moment');

  if (server.votingBetween.indexOf(targetUser?.id) === -1)
    throw error(400, 'Can not vote for kick for that player');

  const userRole = getUserRoleInServer(user?.id);
  const isMafiaUserRole = isMafiaGameRole(userRole);

  if (userRole === GameRoles.Unknown)
    throw error(400, 'Can not vote as a spectator');

  if (server.state == GameStates.Day) {
    if (server.votes.citizens.find(kg => kg.by === user?.id))
      throw error(403, 'Not Authorized');

    server.votes.citizens.push({
      for: targetUserId,
      by: userId,
    });

    server.citizenChat.push({
      id: (server.citizenChat.at(-1)?.id ?? 0) + 1,
      userId: -1,
      content: `${user.name} (${user.id}) voted for ${targetUser.name} (${targetUser.id})`,
      timestamp: Date.now(),
    });
    server.mafiaChat.push({
      id: (server.mafiaChat.at(-1)?.id ?? 0) + 1,
      userId: -1,
      content: `${user.name} (${user.id}) voted for ${targetUser.name} (${targetUser.id})`,
      timestamp: Date.now(),
    });

    server.whoCanVoteKick = server.whoCanVoteKick.filter(e => e !== user?.id);
  }
  else {
    if (!isMafiaUserRole)
      throw error(403, 'Not Authorized');

    if ((userRole === GameRoles.Don && server.votes.don)
      ?? (server.votes.mafia.find(kg => kg.by === user?.id)))
      throw error(403, 'Not Authorized');


    if (userRole === GameRoles.Don) server.votes.don = userId;
    else server.votes.mafia.push({
      for: targetUserId,
      by: userId,
    });

    server.mafiaChat.push({
      id: (server.mafiaChat.at(-1)?.id ?? 0) + 1,
      userId: -1,
      content: `<i>${user.name} (${user.id}) voted for ${targetUser.name} (${targetUser.id})</i>`,
      timestamp: Date.now(),
    });

    server.whoCanVoteKick = server.whoCanVoteKick.filter(e => e !== user?.id);
  }

  // @ts-expect-error Yeah
  return json({}, { statusCode: 200 });
}

