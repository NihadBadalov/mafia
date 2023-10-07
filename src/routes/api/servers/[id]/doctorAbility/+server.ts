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

  if (!server.specialStates.doctorAbility)
    throw error(403, 'Doctor cannot use his ability at the moment');

  let userRole = getUserRoleInServer(user?.id);
  if (userRole !== GameRoles.Doctor)
    throw error(403, 'Cannot save as not a Doctor');


  if (!server.specialStates.doctorAbility)
    return json({}, { statusCode: 200 } as ResponseInit);

  server.specialStates.doctorAbility = false;

  server.votes.doctor = targetUser?.id;
  await gameAnnounce(
    `${targetUser?.name} WILL BE<br>SAVED FOR THE NIGHT`,
    [GameRoles.Sheriff],
    serverId,
  );

  await wait(3_000);


  // @ts-ignore
  return json({}, { statusCode: 200 });
}

