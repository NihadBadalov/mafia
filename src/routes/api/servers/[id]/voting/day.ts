import { gameAnnounce, getUserById } from "$lib";
import type { User } from "$types";
import type GameServer from "$lib/server/GameServer";
import { json } from "@sveltejs/kit";
import type { Socket } from "socket.io-client";
import type { DefaultEventsMap } from "socket.io/dist/typed-events";
import { setTimeout as wait } from "timers/promises";

export async function day(
  server: GameServer,
  io: Socket<DefaultEventsMap, DefaultEventsMap>,
  votingBetween: any,
): Promise<Response> {
  server.playersCanChat = true;
  server.whoCanVoteKick = structuredClone(server.players);
  server.votingBetween = votingBetween
    ?? (server?.votingBetween?.length ? server?.votingBetween : undefined)
    ?? structuredClone(server.players);

  io.emit('serverEvent', {
    message: 'playSong',
    songName: 'voting',
    serverId: server?.id,
  });
  server.playingSong = 'voting';

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
        'TWO PEOPLE HAVE THE SAME AMOUNT OF VOTES',
        'all',
        server.id,
      );
      await wait(2_500);
      await gameAnnounce(
        `CHOOSE TO VOTE-KICK BETWEEN ${votingBetweenUsers[0].name} AND ${votingBetweenUsers[1].name}`,
        'all',
        server.id,
      );
    }
  }
  else {
    await gameAnnounce(
      'VOTE-KICK TIME!',
      'all',
      server.id,
    );
    await wait(1_000);
    await gameAnnounce(
      'DISCUSS WHO TO <span class="color_red">KICK</span><br>(vote for yourselves to skip)',
      'all',
      server.id,
    );
  }

  // Trigger bot day start
  for (let i = 0; i < server.bots.length; i++) {
    const bot = server.bots[i];
    bot.day!(server);
  }

  // Start a timer
  server.totalTimerSeconds = 60;
  for (let i = 60; i > 0; i--) {
    if (
      server.votes.citizens.length === server.players.length
    ) break;
    server.timer = i;
    io.emit('serverEvent', {
      message: 'updateServer',
      serverId: server.id,
    });
    await wait(1000);
  }
  server.totalTimerSeconds = undefined;
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
