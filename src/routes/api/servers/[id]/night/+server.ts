import { json, error, type RequestHandler } from '@sveltejs/kit';
import { _data } from '$api';
import type { GameServer } from '$types';
import { GameStates } from '$types/GameStates';
import { setTimeout as wait } from 'node:timers/promises';
import { io } from '$lib/webSocketConnection';
import { gameAnnounce, getUserById, getUserRoleInServer, isMafiaGameRole } from '$lib';
import { GameRoles } from '$types/GameRoles';


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
    message: 'playSong',
    songName: 'night',
    serverId: serverId,
  });

  io.emit('serverEvent', {
    message: 'updateServer',
    serverId: serverId,
  });

  await gameAnnounce(
    'NIGHT FALLS, THE VILLAGE GOES TO SLEEP...',
    'all',
    serverId,
  );
  await wait(2_500);

  await gameAnnounce(
    'THE <span class="color_red">MAFIA</span> WAKE UP',
    'citizens',
    serverId,
  );

  let voting;
  if (type === 'first') {
    await gameAnnounce('DISCUSS THE GAME <span class="color_red">PLAN</span>', 'mafia', serverId);

    // Start a timer
    server.totalTimerSeconds = 30;
    for (let i = 30; i > 0; i--) {
      server.timer = i;
      io.emit('serverEvent', {
        message: 'updateServer',
        serverId: serverId,
      });
      await wait(1000);
    }
    server.totalTimerSeconds = undefined;
    server.timer = undefined;
  }
  else {
    // Not the first night
    // Mafia voting
    server.votes.mafia = [];
    await gameAnnounce(
      'VOTE TO <span class="color_red">KILL</span> SOMEONE<br>(don\'t vote to skip)',
      'mafia',
      serverId
    );

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
          votingBetween: voting?.killedPerson,
          passedDonChoice: voting?.donChoice,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      } as RequestInit);

      voting = await voting.json();
    }

    await gameAnnounce(
      'THE MAFIA HAVE CHOSEN WHOM TO KILL',
      'all',
      serverId,
    );
    await wait(6_000);

    // Sheriff
    if (server.players.some(pid => getUserRoleInServer(pid) === GameRoles.Sheriff)) {
      server.specialStates.sheriffAbility = true;

      await gameAnnounce(
        'MAFIA GOES TO SLEEP',
        'all',
        serverId,
      );
      await wait(1_500);
      await gameAnnounce(
        '<br>THE <span class="color_red">SHERIFF</span> WAKES UP',
        'all',
        serverId,
      );
      await wait(1_500);
      await gameAnnounce(
        'CLICK ON SOMEONE<br>TO <span class="color_red">VIEW</span> THEIR <span class="color_red">ROLE</span>',
        [GameRoles.Sheriff],
        serverId,
      );

      let sheriffBot = server.bots.find(bot => bot.gameRole === GameRoles.Sheriff);
      if (sheriffBot) sheriffBot.night!(server);

      // Start a timer
      server.totalTimerSeconds = 30;
      for (let i = 30; i > 0; i--) {
        if (
          (server.specialStates.sheriffAbility as boolean) === false
        ) break;
        server.timer = i;
        io.emit('serverEvent', {
          message: 'updateServer',
          serverId: serverId,
        });
        await wait(1000);
      }
      server.totalTimerSeconds = undefined;
      server.timer = undefined;

      server.specialStates.sheriffAbility = false;

      await gameAnnounce(
        'THE SHERIFF HAS VIEWED A PLAYER\'S ROLE',
        'all',
        serverId,
      );

      // Because we can't put the wait in the sherifAbility,
      // since the waiting loop ends,
      // we will put it here
      await wait(6_000);
    }

    // Doctor
    let doctorChoice: number | undefined;
    if (server.players.some(pid => getUserRoleInServer(pid) === GameRoles.Doctor)) {
      server.specialStates.doctorAbility = true;

      await gameAnnounce(
        'SHERIFF GOES TO SLEEP',
        'all',
        serverId,
      );
      await wait(1_500);
      await gameAnnounce(
        '<span class="color_red">SHERIFF</span> GOES TO SLEEP,<br>THE <span class="color_red">DOCTOR</span> WAKES UP',
        'all',
        serverId,
      );
      await wait(1_500);
      await gameAnnounce(
        'CLICK ON SOMEONE TO<br><span class="color_red">SAVE</span> THEM FOR THE <span class="color_red">NIGHT</span>',
        [GameRoles.Doctor],
        serverId,
      );

      let doctorBot = server.bots.find(bot => bot.gameRole === GameRoles.Doctor);
      if (doctorBot) doctorBot.night!(server);

      // Start a timer
      server.totalTimerSeconds = 30;
      for (let i = 30; i > 0; i--) {
        if (
          (server.specialStates.doctorAbility as boolean) === false
        ) break;
        server.timer = i;
        io.emit('serverEvent', {
          message: 'updateServer',
          serverId: serverId,
        });
        await wait(1000);
      }
      server.totalTimerSeconds = undefined;
      server.timer = undefined;

      server.specialStates.doctorAbility = false;
      doctorChoice = server.votes.doctor;
      server.votes.doctor = undefined;

      await gameAnnounce(
        'THE DOCTOR HAS HEALED A PLAYER',
        'all',
        serverId,
      );
      await wait(6_000);
    }

    // Announcing and near-end
    const killedPersonId = typeof ((voting as any)?.killedPerson) === 'number'
      ? ((voting as any)?.killedPerson === doctorChoice ? [] : (voting as any)?.killedPerson)
      : ((voting as any)?.killedPerson as number[]).filter(n => n !== doctorChoice);
    let killText = (() => {
      if (typeof (killedPersonId) === 'number') {
        let u = getUserById(killedPersonId);
        if (!u) return 'NO PLAYERS WERE KILLED';
        return `${u.name} WAS KILLED`;
      }
      if (!Array.isArray(killedPersonId)) return 'NO PLAYERS WERE KILLED';
      killedPersonId
      return 'NO PLAYERS WERE KILLED';
    })();
    const killedPersonIdByDon = ((voting as any)?.donChoice || 0) === doctorChoice ? 0 : ((voting as any)?.donChoice || 0);

    // Kill player, if there is one to kill
    if (killText?.endsWith(' WAS KILLED')) {
      server.playerBlacklist.push(killedPersonId);
      server.players = server.players.filter(pid => pid !== killedPersonId);
      if (server.bots.find(b => b.userId === killedPersonId)) {
        server.bots.find(b => b.userId === killedPersonId)?.selfDestruct();
      }
    }
    // Don's choice
    if (killedPersonIdByDon) {
      server.playerBlacklist.push(killedPersonIdByDon);
      server.players = server.players.filter(pid => pid !== killedPersonIdByDon);
      if (server.bots.find(b => b.userId === killedPersonIdByDon)) {
        server.bots.find(b => b.userId === killedPersonIdByDon)?.selfDestruct();
      }
    }


    // Change announcement text if both Mafia and Don killed someone
    if (killedPersonId && killText?.endsWith(' WAS KILLED')) {
      const u = getUserById(killedPersonIdByDon);
      if (u) {
        killText = killText.replace('WAS', 'WERE');
        killText = `${u.name} AND ${killText}`;
      }
    }

    await gameAnnounce(
      'THE VILLAGE WAKES UP...',
      'all',
      server?.id,
    );
    await wait(3_000);

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
    for (let i = 0; i < server.bots.length; i++) {
      server.bots[i].selfDestruct();
    }
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

