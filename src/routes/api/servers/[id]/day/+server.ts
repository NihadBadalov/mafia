import { json, error, type RequestHandler } from '@sveltejs/kit';
import { _data } from '$api';
import type { GameServer } from '$types';
import { GameStates } from '$types/GameStates';
import { setTimeout as wait } from 'node:timers/promises';
import { gameAnnounce, getUserById, getUserRoleInServer, isMafiaGameRole } from '$lib';
import { io } from '$lib/webSocketConnection';


export const POST: RequestHandler = async ({ request, params, fetch }) => {
  let { origin, dayType } = await request.json();

  if (origin !== _data.serverPassphrase)
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

  if (dayType === 'first') {
    await gameAnnounce(
      '<span class="color_red">FIRST DAY!</span><br>GET TO KNOW EACH OTHER',
      'all',
      serverId,
    );

    for (let i = 45; i > -1; i--) {
      if (
        server.votes.citizens.length === server.players.length
      ) break;
      server.timer = i;
      io.emit('serverEvent', {
        message: 'updateServer',
        serverId: serverId,
      });
      await wait(1000);
    }
    server.timer = undefined;

    await wait(3_000);
  }

  else {
    // Not the first day
    await gameAnnounce(
      '<span class="color_red">CITIZENS</span> WAKE UP',
      'all',
      serverId,
    );

    let voting = await fetch(`/api/servers/${server.id}/voting`, {
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
      && (Array.isArray((voting as any)?.kickedPerson) && (voting as any)?.kickedPerson.length !== 0)) {
      // Don't start a second vote-kick round if no one has voted
      // Pending between 2 people
      server.votingBetween = (voting as any)?.kickedPerson;

      await wait(3_000);

      voting = await fetch(`/api/servers/${server.id}/voting`, {
        method: 'POST',
        body: JSON.stringify({
          origin: _data.serverPassphrase,
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
      server.players = server.players.filter(pid => pid !== kickedPersonId);
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
  }

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
    fetch(`/api/servers/${server.id}/night`, {
      method: 'POST',
      body: JSON.stringify({
        origin: _data.serverPassphrase,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    } as RequestInit);
  }


  // @ts-ignore
  return json({}, { statusCode: 200 });
}

