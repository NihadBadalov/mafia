import { j as json } from "../../../../chunks/index.js";
import { _ as _data } from "../../../../chunks/index4.js";
import { g as getUserByAst, a as getGameServerWithUserById, G as GameRoles, b as getUserRoleInServer, i as isMafiaGameRole } from "../../../../chunks/index3.js";
import { G as GameStates } from "../../../../chunks/GameStates.js";
const GET = async ({ cookies, setHeaders, url }) => {
  let user = getUserByAst(cookies.get("ast"));
  let userServer;
  if (user)
    userServer = getGameServerWithUserById(user?.id);
  setHeaders({
    "Cache-Control": "max-age=3"
  });
  let dc = structuredClone(_data);
  dc.userAsts = void 0;
  delete dc.userAsts;
  delete dc.serverPassphrase;
  for (const server of dc.servers) {
    if (!server.playerRoles?.length)
      continue;
    if (!server.started)
      continue;
    if (!user || !userServer || typeof userServer?.id === "number" && userServer?.id !== server.id) {
      for (let j = 0; j < server.playerRoles?.length; j++) {
        server.playerRoles[j].role = GameRoles.Unknown;
      }
      for (const [roleId] of Object.entries(server.announcements)) {
        if (roleId === "" + GameRoles.Unknown)
          continue;
        server.announcements[+roleId] = "";
      }
      continue;
    }
    const userServerRoleId = getUserRoleInServer(user?.id);
    const userIsMafia = isMafiaGameRole(userServerRoleId);
    if (userIsMafia) {
      for (let j = 0; j < server.playerRoles?.length; j++) {
        if (!isMafiaGameRole(server.playerRoles[j].role))
          server.playerRoles[j].role = GameRoles.Unknown;
      }
    }
    if (!userIsMafia) {
      for (let j = 0; j < server.playerRoles?.length; j++) {
        if (server.playerRoles[j]?.userId === user?.id)
          continue;
        server.playerRoles[j].role = GameRoles.Unknown;
      }
      server.mafiaChat = [];
      server.whoCanVoteKick = [];
      server.votingBetween = [];
      server.votes.don = void 0;
      server.votes.mafia = [];
    }
    for (const [roleId] of Object.entries(server.announcements)) {
      if (+roleId === userServerRoleId)
        continue;
      server.announcements[+roleId] = "";
    }
  }
  return json({ ...dc, endpoint: url?.href });
};
const POST = async ({ request, cookies }) => {
  let { serverName, maxPlayerAmount, amountOfMafia } = await request.json();
  if (Number.isNaN(maxPlayerAmount) || Number.isNaN(amountOfMafia))
    return new Response(void 0, {
      status: 400,
      statusText: "Max player amount and amount of mafia can't be a text"
    });
  if (maxPlayerAmount < 6)
    return json({
      success: false,
      message: "Max player amount can not be less than 6"
    }, { status: 400 });
  const specialChars = [
    "@",
    "$",
    "$",
    "%",
    "^",
    "&",
    "*",
    "\\",
    "'",
    "\n",
    "	",
    "\r"
  ];
  for (let i = 0; i < specialChars?.length; i++) {
    serverName = serverName.replaceAll(specialChars[i], "#");
  }
  function getNewServerId() {
    for (let i = 1; i < _data.servers?.length + 2; i++) {
      if (!_data.servers.find((s) => s?.id === i))
        return i;
    }
    return 1337;
  }
  const newServerId = getNewServerId();
  _data.servers.unshift({
    id: newServerId,
    name: serverName,
    maxPlayerCount: maxPlayerAmount,
    mafiaCount: amountOfMafia,
    players: [],
    initialPlayers: [],
    playerRoles: [],
    playerBlacklist: [],
    ownerId: getUserByAst(cookies.get("ast"))?.id,
    started: false,
    state: GameStates.Waiting,
    specialStates: {
      sheriffAbility: false,
      doctorAbility: false
    },
    announcements: {
      [GameRoles.Mafia]: "",
      [GameRoles.Don]: "",
      [GameRoles.Citizen]: "",
      [GameRoles.Doctor]: "",
      [GameRoles.Sheriff]: ""
    },
    citizenChat: [],
    mafiaChat: [],
    playersCanChat: true,
    votingBetween: [],
    whoCanVoteKick: [],
    votes: {
      don: void 0,
      doctor: void 0,
      mafia: [],
      citizens: []
    },
    timer: void 0
  });
  _data.servers = _data.servers;
  return json({ success: true, serverId: newServerId }, { status: 200 });
};
export {
  GET,
  POST
};
