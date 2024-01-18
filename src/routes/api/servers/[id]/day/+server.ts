import { json, error, type RequestHandler } from '@sveltejs/kit';
import { _data } from '$api';
import { GameStates } from '$types/GameStates';
import { setTimeout as sleep } from 'node:timers/promises';
import { gameAnnounce, getUserById, getUserRoleInServer, isMafiaGameRole } from '$lib';
import { io } from '$lib/webSocketConnection';


export const POST: RequestHandler = async ({ request, params, fetch }) => {
  const { origin, dayType } = await request.json();

  if (origin !== _data.serverPassphrase)
    throw error(403, 'Not Authorized');

  if (!params?.id || isNaN(params?.id as any))
    throw error(404, 'Couldn\'t find the server');

  const serverId = +params?.id;
  const server = _data.servers.find(s => s.id === serverId)!;
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

    for (let i = 0; i < server.bots.length; i++) {
      server.bots[i].gameStarted();
    }

    // Start a timer
    server.totalTimerSeconds = 45;
    for (let i = 45; i > 0; i--) {
      if (
        server.votes.citizens.length === server.players.length
      ) break;
      server.timer = i;
      io.emit('serverEvent', {
        message: 'updateServer',
        serverId: serverId,
      });
      await sleep(1000);
    }
    server.totalTimerSeconds = undefined;
    server.timer = undefined;

    await sleep(3_000);
  }

  else {
    // Not the first day
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

      await sleep(3_000);

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
        const u = getUserById(kickedPersonId);
        if (!u) return 'NO PLAYERS WERE VOTE-KICKED';
        return `${u.name} WAS VOTE-KICKED`;
      }
      if (!Array.isArray(kickedPersonId)) return 'NO PLAYERS WERE VOTE-KICKED';
      return 'NO PLAYERS WERE VOTE-KICKED';
    })();


    // Kick player, if there is one to kick
    if (kickText?.endsWith(' WAS VOTE-KICKED')) {
      server.playerBlacklist.push(kickedPersonId);

      const kickedPersonInd = server.players.indexOf(kickedPersonId);
      if (kickedPersonInd !== -1) server.players.splice(kickedPersonInd, 1);

      io.emit('serverEvent', {
        message: 'updateServer',
        serverId: serverId,
      });
    }

    await gameAnnounce(
      'AFTER A VOTE-KICK...',
      'all',
      server?.id,
    );

    await sleep(3_000);

    await gameAnnounce(
      kickText,
      'all',
      server?.id,
    );

    // Show the role
    if (kickText?.endsWith(' WAS VOTE-KICKED')) {
      await sleep(5_000);

      await fetch(`/api/servers/${server.id}/revealPlayerRole`, {
        method: 'POST',
        body: JSON.stringify({
          origin: _data.serverPassphrase,
          userIds: [kickedPersonId],
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      } as RequestInit);
    }

    await sleep(3_000);
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


  // @ts-expect-error Yeah
  return json({}, { statusCode: 200 });
}

