import { json, error, type RequestHandler } from '@sveltejs/kit';
import { _data } from '$api';
import type { GameServer, User } from '$types';
import { GameStates } from '$types/GameStates';
import { setTimeout as wait } from 'node:timers/promises';
import { gameAnnounce, getUserById, getUserRoleInServer, isMafiaGameRole } from '$lib';
import { io } from '$lib/webSocketConnection';


export const POST: RequestHandler = async ({ request, params }) => {
  let { origin, votingBetween, passedDonChoice } = await request.json();

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


  if (server.state === GameStates.Day) {
    // Day
    server.playersCanChat = true;
    server.whoCanVoteKick = structuredClone(server.players);
    server.votingBetween = votingBetween
      ?? (server?.votingBetween?.length ? server?.votingBetween : undefined)
      ?? structuredClone(server.players);

    if (server.votingBetween.length === 2) {
      // Anounce that we are voting between 2 players
      const votingBetweenUsers: User[] = [];
      for (let i = 0; i < server.votingBetween.length; i++) {
        let u = getUserById(server.votingBetween[i]);
        if (u) votingBetweenUsers.push(u);
      }

      if (!votingBetweenUsers.length) {
        // @ts-ignore
        return json({ complete: true, kickedPerson: [] }, { statusCode: 200 });
      }
      else {
        await gameAnnounce(
          `CHOOSE TO VOTE-KICK BETWEEN ${votingBetweenUsers[0].name} AND ${votingBetweenUsers[1].name}`,
          'all',
          serverId,
        );
      }
    }
    else {
      await gameAnnounce(
        'DISCUSS WHO TO <span class="color_red">KICK</span><br>(vote for yourselves to skip)',
        'all',
        serverId,
      );
    }

    for (let i = 30; i > -1; i--) {
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

    server.whoCanVoteKick = [];

    let chosenPlayerIds: number[] = [];
    for (const kickInfo of server.votes.citizens) {
      chosenPlayerIds.push(kickInfo.for);
    }

    const chosenPlayerId = (() => {
      const voteCounts: Record<number, number> = {};

      chosenPlayerIds.forEach((playerId) => {
        if (voteCounts[playerId] === undefined) {
          voteCounts[playerId] = 1;
        } else {
          voteCounts[playerId]++;
        }
      });

      const maxVotes = Math.max(...Object.values(voteCounts));
      const maxVotePlayers = Object.keys(voteCounts).filter(
        (playerId) => voteCounts[playerId as any] === maxVotes
      );

      if (maxVotePlayers.length === 1) {
        return parseInt(maxVotePlayers[0]);
      } else if (maxVotePlayers.length === 2) {
        return maxVotePlayers.map((playerId) => parseInt(playerId));
      } else {
        return [];
      }
    })();

    server.votes.citizens = [];
    server.votingBetween = [];

    if (typeof (chosenPlayerId) === 'number') {
      // @ts-ignore
      return json({ complete: true, kickedPerson: chosenPlayerId }, { statusCode: 200 });
    }

    // @ts-ignore
    return json({ complete: false, kickedPerson: chosenPlayerId }, { statusCode: 200 });
  }

  else {
    // Night
    server.playersCanChat = true;
    server.whoCanVoteKick = structuredClone(server.players)
      .filter(p => isMafiaGameRole(getUserRoleInServer(p)));
    server.votingBetween = votingBetween
      ?? (server?.votingBetween.length ? server?.votingBetween : undefined)
      ?? structuredClone(server.players);
    server.votingBetween = server.votingBetween
      .filter(p => !isMafiaGameRole(getUserRoleInServer(p)));

    if (server.votingBetween.length === 2) {
      // Anounce that we are voting between 2 players
      const votingBetweenUsers: User[] = [];
      for (let i = 0; i < server.votingBetween.length; i++) {
        let u = getUserById(server.votingBetween[i]);
        if (u) votingBetweenUsers.push(u);
      }

      if (!votingBetweenUsers.length) {
        // @ts-ignore
        return json({ complete: true, killedPerson: [] }, { statusCode: 200 });
      }
      else {
        await gameAnnounce(
          `CHOOSE TO <span class="color_red">KILL</span> BETWEEN ${votingBetweenUsers[0].name} AND ${votingBetweenUsers[1].name}`,
          'mafia',
          serverId,
        );
      }
    }
    else {
      await gameAnnounce(
        'DISCUSS WHO TO <span class="color_red">KILL</span><br>(vote for yourselves to skip)',
        'mafia',
        serverId,
      );
    }

    for (let i = 40; i > -1; i--) {
      if (
        server.votes.mafia.length + (+!!server.votes.don) === server.players.filter(p => isMafiaGameRole(getUserRoleInServer(p))).length
      ) break;
      server.timer = i;
      io.emit('serverEvent', {
        message: 'updateServer',
        serverId: serverId,
      });
      await wait(1000);
    }
    server.timer = undefined;

    server.whoCanVoteKick = [];

    let chosenPlayerIds: number[] = [];
    for (const kickInfo of server.votes.mafia) {
      chosenPlayerIds.push(kickInfo.for);
    }

    const chosenPlayerId = (() => {
      const voteCounts: Record<number, number> = {};

      chosenPlayerIds.forEach((playerId) => {
        if (voteCounts[playerId] === undefined) {
          voteCounts[playerId] = 1;
        } else {
          voteCounts[playerId]++;
        }
      });

      const maxVotes = Math.max(...Object.values(voteCounts));
      const maxVotePlayers = Object.keys(voteCounts).filter(
        (playerId) => voteCounts[playerId as any] === maxVotes
      );

      if (maxVotePlayers.length === 1) {
        return parseInt(maxVotePlayers[0]);
      } else if (maxVotePlayers.length === 2) {
        return maxVotePlayers.map((playerId) => parseInt(playerId));
      } else {
        return [];
      }
    })();

    let donChoice = passedDonChoice ?? server.votes.don;
    server.votes.mafia = [];
    server.votes.don = undefined;
    server.votingBetween = [];

    return json({
      complete: typeof (chosenPlayerId) === 'number',
      killedPerson: chosenPlayerId,
      donChoice: donChoice,
      // @ts-ignore
    }, { statusCode: 200 });
  }

}

