import { e as error, j as json } from "../../../../../../chunks/index.js";
import { _ as _data } from "../../../../../../chunks/index4.js";
import { G as GameStates } from "../../../../../../chunks/GameStates.js";
import { setTimeout } from "node:timers/promises";
import { c as getUserById, d as gameAnnounce, i as isMafiaGameRole, b as getUserRoleInServer } from "../../../../../../chunks/index3.js";
import { i as io } from "../../../../../../chunks/webSocketConnection.js";
const POST = async ({ request, params }) => {
  let { origin, votingBetween, passedDonChoice } = await request.json();
  if (origin !== _data.serverPassphrase)
    throw error(403, "Not Authorized");
  if (!params?.id || isNaN(params?.id))
    throw error(404, "Couldn't find the server");
  let serverId = +params?.id;
  let server = _data.servers.find((s) => s.id === serverId);
  if (!server)
    throw error(404, "Couldn't find the server");
  if (!server.started)
    throw error(403, "Not Authorized");
  if (server.state === GameStates.Day) {
    server.playersCanChat = true;
    server.whoCanVoteKick = structuredClone(server.players);
    server.votingBetween = votingBetween ?? (server?.votingBetween?.length ? server?.votingBetween : void 0) ?? structuredClone(server.players);
    io.emit("serverEvent", {
      message: "playSong",
      songName: "voting",
      serverId: server?.id
    });
    if (server.votingBetween.length === 2) {
      const votingBetweenUsers = [];
      for (let i = 0; i < server.votingBetween.length; i++) {
        let u = getUserById(server.votingBetween[i]);
        if (u)
          votingBetweenUsers.push(u);
      }
      if (!votingBetweenUsers.length) {
        return json({ complete: true, kickedPerson: [] }, { statusCode: 200 });
      } else {
        await gameAnnounce(
          `CHOOSE TO VOTE-KICK BETWEEN ${votingBetweenUsers[0].name} AND ${votingBetweenUsers[1].name}`,
          "all",
          serverId
        );
      }
    } else {
      await gameAnnounce(
        'DISCUSS WHO TO <span class="color_red">KICK</span><br>(vote for yourselves to skip)',
        "all",
        serverId
      );
    }
    for (let i = 30; i > -1; i--) {
      if (server.votes.citizens.length === server.players.length)
        break;
      server.timer = i;
      io.emit("serverEvent", {
        message: "updateServer",
        serverId
      });
      await setTimeout(1e3);
    }
    server.timer = void 0;
    server.whoCanVoteKick = [];
    let chosenPlayerIds = [];
    for (const kickInfo of server.votes.citizens) {
      chosenPlayerIds.push(kickInfo.for);
    }
    const chosenPlayerId = (() => {
      const voteCounts = {};
      chosenPlayerIds.forEach((playerId) => {
        if (voteCounts[playerId] === void 0) {
          voteCounts[playerId] = 1;
        } else {
          voteCounts[playerId]++;
        }
      });
      const maxVotes = Math.max(...Object.values(voteCounts));
      const maxVotePlayers = Object.keys(voteCounts).filter(
        (playerId) => voteCounts[playerId] === maxVotes
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
    if (typeof chosenPlayerId === "number") {
      return json({ complete: true, kickedPerson: chosenPlayerId }, { statusCode: 200 });
    }
    return json({ complete: false, kickedPerson: chosenPlayerId }, { statusCode: 200 });
  } else {
    server.playersCanChat = true;
    server.whoCanVoteKick = structuredClone(server.players).filter((p) => isMafiaGameRole(getUserRoleInServer(p)));
    server.votingBetween = votingBetween ?? (server?.votingBetween.length ? server?.votingBetween : void 0) ?? structuredClone(server.players);
    server.votingBetween = server.votingBetween.filter((p) => !isMafiaGameRole(getUserRoleInServer(p)));
    io.emit("serverEvent", {
      message: "playSong",
      songName: "voting",
      serverId: server?.id
    });
    if (server.votingBetween.length === 2) {
      const votingBetweenUsers = [];
      for (let i = 0; i < server.votingBetween.length; i++) {
        let u = getUserById(server.votingBetween[i]);
        if (u)
          votingBetweenUsers.push(u);
      }
      if (!votingBetweenUsers.length) {
        return json({ complete: true, killedPerson: [] }, { statusCode: 200 });
      } else {
        await gameAnnounce(
          `CHOOSE TO <span class="color_red">KILL</span> BETWEEN ${votingBetweenUsers[0].name} AND ${votingBetweenUsers[1].name}`,
          "mafia",
          serverId
        );
      }
    } else {
      await gameAnnounce(
        'DISCUSS WHO TO <span class="color_red">KILL</span>',
        "mafia",
        serverId
      );
    }
    for (let i = 40; i > -1; i--) {
      if (server.votes.mafia.length + +!!server.votes.don === server.players.filter((p) => isMafiaGameRole(getUserRoleInServer(p))).length)
        break;
      server.timer = i;
      io.emit("serverEvent", {
        message: "updateServer",
        serverId
      });
      await setTimeout(1e3);
    }
    server.timer = void 0;
    server.whoCanVoteKick = [];
    let chosenPlayerIds = [];
    for (const kickInfo of server.votes.mafia) {
      chosenPlayerIds.push(kickInfo.for);
    }
    const chosenPlayerId = (() => {
      const voteCounts = {};
      chosenPlayerIds.forEach((playerId) => {
        if (voteCounts[playerId] === void 0) {
          voteCounts[playerId] = 1;
        } else {
          voteCounts[playerId]++;
        }
      });
      const maxVotes = Math.max(...Object.values(voteCounts));
      const maxVotePlayers = Object.keys(voteCounts).filter(
        (playerId) => voteCounts[playerId] === maxVotes
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
    server.votes.don = void 0;
    server.votingBetween = [];
    return json({
      complete: typeof chosenPlayerId === "number",
      killedPerson: chosenPlayerId,
      donChoice
      // @ts-ignore
    }, { statusCode: 200 });
  }
};
export {
  POST
};
