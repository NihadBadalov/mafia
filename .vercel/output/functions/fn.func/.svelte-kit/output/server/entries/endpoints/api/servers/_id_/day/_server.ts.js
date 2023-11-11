import { e as error, j as json } from "../../../../../../chunks/index.js";
import { _ as _data } from "../../../../../../chunks/index4.js";
import { G as GameStates } from "../../../../../../chunks/GameStates.js";
import { setTimeout } from "node:timers/promises";
import { d as gameAnnounce, c as getUserById, i as isMafiaGameRole, b as getUserRoleInServer } from "../../../../../../chunks/index3.js";
import { i as io } from "../../../../../../chunks/webSocketConnection.js";
const POST = async ({ request, params, fetch }) => {
  let { origin, dayType } = await request.json();
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
  server.state = GameStates.Day;
  if (dayType === "first") {
    await gameAnnounce(
      '<span class="color_red">FIRST DAY!</span><br>GET TO KNOW EACH OTHER',
      "all",
      serverId
    );
    for (let i = 45; i > -1; i--) {
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
    await setTimeout(3e3);
  } else {
    await gameAnnounce(
      '<span class="color_red">CITIZENS</span> WAKE UP',
      "all",
      serverId
    );
    let voting = await fetch(`/api/servers/${server.id}/voting`, {
      method: "POST",
      body: JSON.stringify({
        origin: _data.serverPassphrase
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });
    voting = await voting.json();
    if (!voting?.complete && (Array.isArray(voting?.kickedPerson) && voting?.kickedPerson.length !== 0)) {
      server.votingBetween = voting?.kickedPerson;
      await setTimeout(3e3);
      voting = await fetch(`/api/servers/${server.id}/voting`, {
        method: "POST",
        body: JSON.stringify({
          origin: _data.serverPassphrase,
          votingBetween: server?.votingBetween
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });
      voting = await voting.json();
      server.votingBetween = [];
    }
    const kickedPersonId = voting?.kickedPerson;
    const kickText = (() => {
      if (typeof kickedPersonId === "number") {
        let u = getUserById(kickedPersonId);
        if (!u)
          return "NO PLAYERS WERE VOTE-KICKED";
        return `${u.name} WAS VOTE-KICKED`;
      }
      if (!Array.isArray(kickedPersonId))
        return "NO PLAYERS WERE VOTE-KICKED";
      return "NO PLAYERS WERE VOTE-KICKED";
    })();
    if (kickText?.endsWith(" WAS VOTE-KICKED")) {
      server.playerBlacklist.push(kickedPersonId);
      server.players = server.players.filter((pid) => pid !== kickedPersonId);
      io.emit("serverEvent", {
        message: "updateServer",
        serverId
      });
    }
    await gameAnnounce(
      kickText,
      "all",
      server?.id
    );
    await setTimeout(7e3);
  }
  const endVotePlayerRoles = server.players.map((pid) => isMafiaGameRole(getUserRoleInServer(pid)));
  if (endVotePlayerRoles.filter((e) => e).length === 0 || endVotePlayerRoles.filter((e) => e).length >= endVotePlayerRoles.filter((e) => !e).length) {
    fetch(`/api/servers/${server.id}/gameEnd`, {
      method: "POST",
      body: JSON.stringify({
        origin: _data.serverPassphrase
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });
  } else {
    fetch(`/api/servers/${server.id}/night`, {
      method: "POST",
      body: JSON.stringify({
        origin: _data.serverPassphrase
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
  return json({}, { statusCode: 200 });
};
export {
  POST
};
