import { e as error, j as json } from "../../../../../../chunks/index.js";
import { _ as _data } from "../../../../../../chunks/index4.js";
import { G as GameStates } from "../../../../../../chunks/GameStates.js";
import { setTimeout } from "node:timers/promises";
import { i as io } from "../../../../../../chunks/webSocketConnection.js";
import { d as gameAnnounce, b as getUserRoleInServer, G as GameRoles, c as getUserById, i as isMafiaGameRole } from "../../../../../../chunks/index3.js";
const POST = async ({ request, params, fetch }) => {
  let { origin, type } = await request.json();
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
  server.state = GameStates.Night;
  io.emit("serverEvent", {
    message: "playSong",
    songName: "night",
    serverId
  });
  io.emit("serverEvent", {
    message: "updateServer",
    serverId
  });
  await gameAnnounce(
    '<span class="color_red">CITIZENS</span> GO TO SLEEP, <span class="color_red">MAFIA</span> WAKE UP',
    "citizens",
    serverId
  );
  let voting;
  if (type === "first") {
    await gameAnnounce('DISCUSS THE GAME <span class="color_red">PLAN</span>', "mafia", serverId);
    for (let i = 30; i > -1; i--) {
      server.timer = i;
      io.emit("serverEvent", {
        message: "updateServer",
        serverId
      });
      await setTimeout(1e3);
    }
    server.timer = void 0;
  } else {
    server.votes.mafia = [];
    await gameAnnounce(
      `VOTE TO <span class="color_red">KILL</span> SOMEONE<br>(don't vote to skip)`,
      "mafia",
      serverId
    );
    voting = await fetch(`/api/servers/${server.id}/voting`, {
      method: "POST",
      body: JSON.stringify({
        origin: _data.serverPassphrase
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });
    voting = await voting.json();
    if (!voting?.complete && (Array.isArray(voting?.killedPerson) && voting?.killedPerson.length !== 0)) {
      voting = await fetch(`/api/servers/${server.id}/voting`, {
        method: "POST",
        body: JSON.stringify({
          origin: _data.serverPassphrase,
          votingBetween: voting?.killedPerson,
          passedDonChoice: voting?.donChoice
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });
      voting = await voting.json();
    }
    if (server.players.some((pid) => getUserRoleInServer(pid) === GameRoles.Sheriff)) {
      server.specialStates.sheriffAbility = true;
      await gameAnnounce(
        '<span class="color_red">MAFIA</span> GOES TO SLEEP,<br>THE <span class="color_red">SHERIFF</span> WAKES UP',
        "all",
        serverId
      );
      await gameAnnounce(
        'CLICK ON SOMEONE<br>TO <span class="color_red">VIEW</span> THEIR <span class="color_red">ROLE</span>',
        [GameRoles.Sheriff],
        serverId
      );
      for (let i = 30; i > -1; i--) {
        if (server.specialStates.sheriffAbility === false)
          break;
        server.timer = i;
        io.emit("serverEvent", {
          message: "updateServer",
          serverId
        });
        await setTimeout(1e3);
      }
      server.timer = void 0;
      server.specialStates.sheriffAbility = false;
    }
    let doctorChoice;
    if (server.players.some((pid) => getUserRoleInServer(pid) === GameRoles.Doctor)) {
      server.specialStates.doctorAbility = true;
      await gameAnnounce(
        '<span class="color_red">SHERIFF</span> GOES TO SLEEP,<br>THE <span class="color_red">DOCTOR</span> WAKES UP',
        "all",
        serverId
      );
      await gameAnnounce(
        'CLICK ON SOMEONE TO<br><span class="color_red">SAVE</span> THEM FOR THE <span class="color_red">NIGHT</span>',
        [GameRoles.Doctor],
        serverId
      );
      for (let i = 30; i > -1; i--) {
        if (server.specialStates.doctorAbility === false)
          break;
        server.timer = i;
        io.emit("serverEvent", {
          message: "updateServer",
          serverId
        });
        await setTimeout(1e3);
      }
      server.timer = void 0;
      server.specialStates.doctorAbility = false;
      doctorChoice = server.votes.doctor;
      server.votes.doctor = void 0;
    }
    const killedPersonId = typeof voting?.killedPerson === "number" ? voting?.killedPerson === doctorChoice ? [] : voting?.killedPerson : (voting?.killedPerson).filter((n) => n !== doctorChoice);
    const killText = (() => {
      if (typeof killedPersonId === "number") {
        let u = getUserById(killedPersonId);
        if (!u)
          return "NO PLAYERS WERE KILLED";
        return `${u.name} WAS KILLED`;
      }
      if (!Array.isArray(killedPersonId))
        return "NO PLAYERS WERE KILLED";
      return "NO PLAYERS WERE KILLED";
    })();
    if (killText?.endsWith(" WAS KILLED")) {
      server.playerBlacklist.push(killedPersonId);
      server.players = server.players.filter((pid) => pid !== killedPersonId);
    }
    await gameAnnounce(
      killText,
      "all",
      server?.id
    );
    await setTimeout(4e3);
  }
  await setTimeout(3e3);
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
    fetch(`/api/servers/${server.id}/day`, {
      method: "POST",
      body: JSON.stringify({
        origin: _data.serverPassphrase,
        dayType: type === "first" ? "first" : "notFirst"
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
