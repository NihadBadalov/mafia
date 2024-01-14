import { json, error, type RequestHandler } from '@sveltejs/kit';
import { _data } from '$api';
import { gameAnnounce, getUserByAst, getUserById, getUserRoleInServer } from '$lib';
import { GameRoles } from '$types/GameRoles';


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
    || !server.players.find(pid => pid === targetUser?.id))
    throw error(403, 'Not Authorized');

  if (!server.specialStates.doctorAbility)
    throw error(403, 'Doctor cannot use his ability at the moment');

  const userRole = getUserRoleInServer(user?.id);
  if (userRole !== GameRoles.Doctor)
    throw error(403, 'Cannot save as not a Doctor');


  if (!server.specialStates.doctorAbility)
    return json({}, { statusCode: 200 } as ResponseInit);

  server.specialStates.doctorAbility = false;

  server.votes.doctor = targetUser?.id;
  await gameAnnounce(
    `${targetUser?.name} WILL BE<br>SAVED FOR THE NIGHT`,
    [GameRoles.Doctor],
    serverId,
  );


  // @ts-expect-error Yeah
  return json({}, { statusCode: 200 });
}

