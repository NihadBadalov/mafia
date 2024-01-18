import { error, json, type RequestHandler } from '@sveltejs/kit';
import { _data } from '$api';
import { GameStates } from '$types/GameStates';
import { setTimeout as sleep } from 'timers/promises';
import { gameAnnounce } from '$lib';

export const POST: RequestHandler = async ({ request, params }) => {
  const { origin, userIds } = await request.json();

  if (origin !== _data.serverPassphrase)
    throw error(403, 'Not Authorized');

  if (!params?.id || isNaN(params?.id as any))
    throw error(404, 'Couldn\'t find the server');

  const serverId = +params?.id;
  const server = _data.servers.find(s => s.id === serverId)!;
  if (!server) throw error(404, 'Couldn\'t find the server');

  if (!server.started)
    throw error(403, 'Not Authorized');

  if (server.state !== GameStates.Day)
    throw error(403, 'Not Authorized');


  const userIdsToReveal = userIds.filter((e: number | undefined) => e);
  if (!userIdsToReveal.length)
    throw error(403, 'Not Authorized');

  const revealTitle = userIdsToReveal.length > 1
    ? 'THEIR ROLES ARE:'
    : 'HIS ROLE IS:';

  server.specialStates.playerIdsRevealingRoles = userIdsToReveal;
  await gameAnnounce(
    revealTitle,
    'all',
    server.id,
  );

  await sleep(10_000);

  server.specialStates.playerIdsRevealingRoles = [];

  // @ts-expect-error Yeah
  return json({}, { statusCode: 200 });
}
