import { gameAnnounce, getUserById, getUserRoleInServer, isMafiaGameRole } from "$lib";
import type { User } from "$types";
import type GameServer from "$lib/server/GameServer";
import { GameRoles } from "$types/GameRoles";
import { json } from "@sveltejs/kit";
import type { Socket } from "socket.io-client";
import type { DefaultEventsMap } from "socket.io/dist/typed-events";
import { setTimeout as sleep } from "timers/promises";

export async function night(
  server: GameServer,
  io: Socket<DefaultEventsMap, DefaultEventsMap>,
  votingBetween: any,
  passedDonChoice: number | undefined,
): Promise<Response> {
  server.playersCanChat = true;
  server.whoCanVoteKick = structuredClone(server.players)
    .filter(p => isMafiaGameRole(getUserRoleInServer(p)));
  server.votingBetween = votingBetween
    ?? (server?.votingBetween.length ? server?.votingBetween : undefined)
    ?? structuredClone(server.players);
  server.votingBetween = server.votingBetween
    .filter(p => !isMafiaGameRole(getUserRoleInServer(p)));

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
      const u = getUserById(server.votingBetween[i]);
      if (u) votingBetweenUsers.push(u);
    }

    if (!votingBetweenUsers.length) {
      // @ts-expect-error Yeah
      return json({ complete: true, killedPerson: [] }, { statusCode: 200 });
    }
    else {
      await gameAnnounce(
        'TWO PEOPLE HAVE THE SAME AMOUNT OF VOTES',
        'all',
        server.id,
      );
      await sleep(2_500);
      await gameAnnounce(
        `CHOOSE TO <span class="color_red">KILL</span> BETWEEN ${votingBetweenUsers[0].name} AND ${votingBetweenUsers[1].name}`,
        'mafia',
        server.id,
      );
    }
  }
  else {
    await gameAnnounce(
      'KILLING TIME!',
      'all',
      server.id,
    );
    await sleep(1_000);
    await gameAnnounce(
      'DISCUSS WHO TO <span class="color_red">KILL</span>',
      'mafia',
      server.id,
    );
  }

  const mafiaBots = server.bots.filter(bot => bot.gameRole === GameRoles.Mafia || bot.gameRole === GameRoles.Don);
  for (let i = 0; i < mafiaBots.length; i++) {
    mafiaBots[i].night!(server);
  }

  // Start a timer
  server.totalTimerSeconds = 40;
  for (let i = 40; i > 0; i--) {
    if (
      server.votes.mafia.length + (+!!server.votes.don) === server.players.filter(p => isMafiaGameRole(getUserRoleInServer(p))).length
    ) break;
    server.timer = i;
    io.emit('serverEvent', {
      message: 'updateServer',
      serverId: server.id,
    });
    await sleep(1000);
  }
  server.totalTimerSeconds = undefined;
  server.timer = undefined;

  server.whoCanVoteKick = [];

  const chosenPlayerIds: number[] = [];
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

  const donChoice = passedDonChoice ?? server.votes.don;
  server.votes.mafia = [];
  server.votes.don = undefined;
  server.votingBetween = [];

  return json({
    complete: typeof (chosenPlayerId) === 'number',
    killedPerson: chosenPlayerId,
    donChoice: donChoice,
    // @ts-expect-error Yeah
  }, { statusCode: 200 });
}
