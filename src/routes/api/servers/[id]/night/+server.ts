import { json, error, type RequestHandler } from '@sveltejs/kit';
import { _data } from '$api';
import type { GameServer } from '$types';
import { GameStates } from '$types/GameStates';
import { setTimeout as wait } from 'node:timers/promises';
import { io } from '$lib/webSocketConnection';
import { gameAnnounce, getUserById, getUserRoleInServer, isMafiaGameRole } from '$lib';


export const POST: RequestHandler = async ({ request, params, fetch }) => {
  let { origin, type } = await request.json();

  if (origin !== _data.serverPassphrase)
    throw error(403, 'Not Authorized');

  if (!params?.id || isNaN(params?.id as any))
    throw error(404, 'Couldn\'t find the server');

  let serverId = +params?.id;
  let server = _data.servers.find(s => s.id === serverId) as GameServer;
  if (!server) throw error(404, 'Couldn\'t find the server');

  // Check if appropriate player amount to start the server
  if (!server.started)
    throw error(403, 'Not Authorized');


  server.state = GameStates.Night;
  io.emit('serverEvent', {
    message: 'updateServer',
    serverId: serverId,
  });

  await gameAnnounce(
    '<span class="color_red">CITIZENS</span> GO TO SLEEP, <span class="color_red">MAFIA</span> WAKE UP',
    'citizens',
    serverId,
  );

  let voting;
  if (type === 'first') {
    await gameAnnounce('DISCUSS THE GAME <span class="color_red">PLAN</span>', 'mafia', serverId);
    for (let i = 30; i > -1; i--) {
      server.timer = i;
      io.emit('serverEvent', {
        message: 'updateServer',
        serverId: serverId,
      });
      await wait(1000);
    }
    server.timer = undefined;
  }
  else {
    server.votes.mafia = [];
    await gameAnnounce('VOTE TO <span class="color_red">KILL</span> SOMEONE', 'mafia', serverId);

    voting = await fetch(`/api/servers/${server.id}/voting`, {
      method: 'POST',
      body: JSON.stringify({
        origin: _data.serverPassphrase,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    } as RequestInit);

    voting = await voting.json();

    if (!(voting as any)?.complete
      && (Array.isArray((voting as any)?.killedPerson) && (voting as any)?.killedPerson.length !== 0)) {
      // There was a voting and it was incomplete
      voting = await fetch(`/api/servers/${server.id}/voting`, {
        method: 'POST',
        body: JSON.stringify({
          origin: _data.serverPassphrase,
          votingBetween: voting?.votingBetween,
          passedDonChoice: voting?.donChoice,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      } as RequestInit);

      voting = await voting.json();
    }

  }


  if (type !== 'first') {
    const killedPersonId = (voting as any)?.killedPerson;
    const killText = (() => {
      if (typeof (killedPersonId) === 'number') {
        let u = getUserById(killedPersonId);
        if (!u) return 'NO PLAYERS WERE KILLED';
        return `${u.name} WAS KILLED`;
      }
      if (!Array.isArray(killedPersonId)) return 'NO PLAYERS WERE KILLED';
      return 'NO PLAYERS WERE KILLED';
    })();


    // Kill player, if there is one to kill
    if (killText?.endsWith(' WAS KILLED')) {
      server.playerBlacklist.push(killedPersonId);
      server.players = server.players.filter(pid => pid !== killedPersonId);
    }

    await gameAnnounce(
      killText,
      'all',
      server?.id,
    );

    await wait(4_000);
  }

  await wait(3_000);

  const endVotePlayerRoles = server.players.map(pid => isMafiaGameRole(getUserRoleInServer(pid)));
  if (endVotePlayerRoles.filter(e => e).length === 0
    || endVotePlayerRoles.filter(e => e).length >= endVotePlayerRoles.filter(e => !e).length) {
    // Mafias >= citizens
    fetch(`/api/servers/${server.id}/gameEnd`, {
      method: 'POST',
      body: JSON.stringify({
        origin: _data.serverPassphrase,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    } as RequestInit);
  }
  else {
    fetch(`/api/servers/${server.id}/day`, {
      method: 'POST',
      body: JSON.stringify({
        origin: _data.serverPassphrase,
        dayType: type === 'first' ? 'first' : 'notFirst',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    } as RequestInit);
  }


  // @ts-ignore
  return json({}, { statusCode: 200 });
}

