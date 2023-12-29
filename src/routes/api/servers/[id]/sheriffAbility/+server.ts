import { json, error, type RequestHandler } from '@sveltejs/kit';
import { _data } from '$api';
import { gameAnnounce, getUserByAst, getUserById, getUserRoleInServer } from '$lib';
import type { GameServer } from '$types';
import { GameRoles } from '$types/GameRoles';
import { setTimeout as wait } from 'timers/promises';

export const POST: RequestHandler = async ({ request, params }) => {
  let { targetUserId, userId, ast } = await request.json();
  let user = getUserByAst(ast);
  let targetUser = getUserById(targetUserId);

  if (!user?.id || user?.id != userId)
    throw error(403, 'Not Authorized');
  if (!targetUser)
    throw error(400, 'Target user\'s ID is not valid');

  if (!params?.id || isNaN(params?.id as any))
    throw error(404, 'Couldn\'t find the server');
  let serverId = +params?.id;
  let server = _data.servers.find(s => s.id === serverId) as GameServer;
  if (!server) throw error(404, 'Couldn\'t find the server');

  // Check if users are in the server
  if (!server.players.find(pid => pid === user?.id)
    || !server.players.find(pid => pid === targetUser?.id))
    throw error(403, 'Not Authorized');

  if (!server.specialStates.sheriffAbility)
    throw error(403, 'Sheriff cannot use his ability at the moment');

  let userRole = getUserRoleInServer(user?.id);
  if (userRole !== GameRoles.Sheriff)
    throw error(403, 'Cannot view roles as not a Sheriff');

  const targetUserRole = getUserRoleInServer(targetUser?.id);
  if (!targetUserRole)
    throw error(403, 'Couldn\'t fetch target user\'s role in the game server');

  if (!server.specialStates.sheriffAbility)
    return json({}, { statusCode: 200 } as ResponseInit);

  server.specialStates.sheriffAbility = false;

  await gameAnnounce(
    `${targetUser?.name}'S ROLE IS<br>${GameRoles['' + targetUserRole as any]}`,
    [GameRoles.Sheriff],
    serverId,
  );

  // @ts-ignore
  return json({}, { statusCode: 200 });
}

