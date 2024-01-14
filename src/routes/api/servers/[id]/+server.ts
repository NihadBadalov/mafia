import { json, error, type RequestHandler } from '@sveltejs/kit';
import { _data } from '$api';
import { gameAnnounce, getUserByAst, getUserById, getUserRoleInServer } from '$lib';
import { GameRoles } from '$types/GameRoles';
import { setTimeout as sleep } from 'timers/promises';


export const POST: RequestHandler = async ({ request, params }) => {
  const { targetUserId, userId, ast } = await request.json();
  const user = getUserByAst(ast);
  const targetUser = getUserById(targetUserId);

  if (!user?.id || user?.id != userId)
    throw error(403, 'Not Authorized');
  if (!targetUser)
    throw error(400, 'Target user\'s ID is not valid');

  if (!params?.id || isNaN(params?.id as any))
    throw error(404, 'Couldn\'t find the server');
  const serverId = +params?.id;
  const server = _data.servers.find(s => s.id === serverId)!;
  if (!server) throw error(404, 'Couldn\'t find the server');

  // Check if users are in the server
  if (!server.players.find(pid => pid === user?.id)
    || !server.players.find(pid => pid === targetUserId?.id))
    throw error(403, 'Not Authorized');

  if (!server.specialStates.sheriffAbility)
    throw error(403, 'Sheriff cannot use his ability at the moment');

  const userRole = getUserRoleInServer(user?.id);
  if (userRole !== GameRoles.Sheriff)
    throw error(403, 'Can not vote as a spectator');

  const targetUserRole = getUserRoleInServer(targetUser?.id);
  if (!targetUserRole)
    throw error(403, 'Couldn\'t fetch target user\'s role in the game server');


  await gameAnnounce(
    `${targetUser?.name}'S ROLE IS<br>${GameRoles['' + targetUserRole as any]}`,
    [GameRoles.Sheriff],
    serverId,
  );

  await sleep(3_000);

  server.specialStates.sheriffAbility = false;


  // @ts-expect-error Yeah
  return json({}, { statusCode: 200 });
}

