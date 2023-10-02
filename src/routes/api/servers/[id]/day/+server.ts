import { json, error, type RequestHandler } from '@sveltejs/kit';
import { _data } from '$api';
import type { GameServer } from '$types';
import { GameStates } from '$types/GameStates';
import { setTimeout as wait } from 'node:timers/promises';
import { gameAnnounce, getUserById } from '$lib';
import { io } from '$lib/webSocketConnection';


export const POST: RequestHandler = async ({ request, params, fetch }) => {
  let { origin/* , dayType */ } = await request.json();

  if (origin !== 'server')
    throw error(403, 'Not Authorized');

  if (!params?.id || isNaN(params?.id as any))
    throw error(404, 'Couldn\'t find the server');

  let serverId = +params?.id;
  let server = _data.servers.find(s => s.id === serverId) as GameServer;
  if (!server) throw error(404, 'Couldn\'t find the server');

  if (!server.started)
    throw error(403, 'Not Authorized');


  // Main
  server.state = GameStates.Day;

  await gameAnnounce(
    '<span class="color_red">CITIZENS</span> WAKE UP',
    'all',
    serverId,
  );

  let voting = await fetch(`/api/servers/${server.id}/voting`, {
    method: 'POST',
    body: JSON.stringify({
      origin: 'server',
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  } as RequestInit);

  voting = await voting.json();

  if (!(voting as any)?.complete
    // Don't start a second vote-kick round if no one has voted
    && (Array.isArray((voting as any)?.kickedPerson) && (voting as any)?.kickedPerson.length !== 0)) {
    // Pending between 2 people
    server.votingBetween = (voting as any)?.kickedPerson;

    await wait(3_000);

    voting = await fetch(`/api/servers/${server.id}/voting`, {
      method: 'POST',
      body: JSON.stringify({
        origin: 'server',
        votingBetween: server?.votingBetween,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    } as RequestInit);

    voting = await voting.json();

    server.votingBetween = [];
  }

  const kickedPersonId = (voting as any)?.kickedPerson;
  const kickText = (() => {
    if (typeof (kickedPersonId) === 'number') {
      let u = getUserById(kickedPersonId);
      if (!u) return 'NO PLAYERS WERE VOTE-KICKED';
      return `${u.name} WAS VOTE-KICKED`;
    }
    if (!Array.isArray(kickedPersonId)) return 'NO PLAYERS WERE VOTE-KICKED';
    return 'NO PLAYERS WERE VOTE-KICKED';
  })();


  // Kick player, if there is one to kick
  if (kickText?.endsWith(' WAS VOTE-KICKED')) {
    server.playerBlacklist.push(kickedPersonId);
    if (server.players.indexOf(kickedPersonId) !== 1)
      server.players.splice(server.playerBlacklist.indexOf(kickedPersonId), 1);
    io.emit('serverEvent', {
      message: 'updateServer',
      serverId: serverId,
    });
  }

  await gameAnnounce(
    kickText,
    'all',
    server?.id,
  );

  await wait(7_000);

  fetch(`/api/servers/${server.id}/night`, {
    method: 'POST',
    body: JSON.stringify({
      origin: 'server',
      dayType: 'first',
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  } as RequestInit);


  // @ts-ignore
  return json({}, { statusCode: 200 });
}

