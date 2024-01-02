import { json, type RequestHandler } from '@sveltejs/kit';
import { _data } from '../index';
import { getGameServerWithUserById, getUserByAst, getUserRoleInServer, isMafiaGameRole } from '$lib';
import type { ServerData, User } from '$types';
import { GameStates } from '$types/GameStates';
import { GameRoles } from '$types/GameRoles';

export const GET: RequestHandler = async ({ cookies, setHeaders, url }) => {
  let user = getUserByAst(cookies.get('ast'));
  let userServer;
  if (user) userServer = getGameServerWithUserById(user?.id);

  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching
  setHeaders({
    'Cache-Control': 'max-age=3',
  });

  // @ts-ignore
  let dc = structuredClone(_data) as ServerData;
  dc.userAsts = undefined;
  delete dc.userAsts;
  delete dc.serverPassphrase;

  for (const server of dc.servers) {
    if (server.state === GameStates.Ended) continue;
    if (!server.playerRoles?.length) continue;
    if (!server.started) continue;

    // "Outer-sessional" data hiding - hide everything
    // Except when the game is over
    if (!user
      || !userServer
      || (typeof (userServer?.id) === 'number' && userServer?.id !== server.id)) {
      // Idea: Literally reset the properties to their primitive values,
      // such as [] or {} instead of iterating thru them
      for (let j = 0; j < server.playerRoles?.length; j++) {
        server.playerRoles[j].role = GameRoles.Unknown;
      }
      for (const [roleId] of Object.entries(server.announcements)) {
        if (roleId === '' + GameRoles.Unknown) continue;
        server.announcements[+roleId] = '';
      }
      continue;
    }


    // "Inner-sessional" data hiding
    const userServerRoleId = getUserRoleInServer(user?.id);
    const userIsMafia = isMafiaGameRole(userServerRoleId);

    if (userIsMafia) {
      // Hide non-mafia playerRoles for Mafia
      for (let j = 0; j < server.playerRoles?.length; j++) {
        if (!isMafiaGameRole(server.playerRoles[j].role)) server.playerRoles[j].role = GameRoles.Unknown;
      }
    }

    if (!userIsMafia) {
      // Hide mafia playerRoles for Non-mafia
      for (let j = 0; j < server.playerRoles?.length; j++) {
        if (server.playerRoles[j]?.userId === user?.id) continue;
        server.playerRoles[j].role = GameRoles.Unknown;
      }

      server.mafiaChat = [];
      server.whoCanVoteKick = [];
      server.votingBetween = [];
      server.votes.don = undefined;
      server.votes.mafia = [];
    }

    // Hide other stuff
    for (const [roleId] of Object.entries(server.announcements)) {
      if (+roleId === userServerRoleId) continue;
      server.announcements[+roleId] = '';
    }
  }

  // console.log(dc.servers);
  return json({ ...dc, endpoint: url?.href });
}

export const POST: RequestHandler = async ({ request, cookies }) => {
  let { serverName, maxPlayerAmount, amountOfMafia, fillWithBots } = await request.json();

  if (Number.isNaN(maxPlayerAmount) || Number.isNaN(amountOfMafia))
    return new Response(undefined, {
      status: 400,
      statusText: 'Max player amount and amount of mafia can\'t be a text',
    } as ResponseInit);

  if (maxPlayerAmount < 6)
    return json({
      success: false,
      message: 'Max player amount can not be less than 6',
    }, { status: 400 });

  const specialChars = [
    '@', '$', '$', '%', '^', '&', '*',
    '\\', '\'', '\n', '\t', '\r',
  ];

  for (let i = 0; i < specialChars?.length; i++) {
    serverName = serverName.replaceAll(specialChars[i], '#');
  }

  function getNewServerId(): number {
    for (let i = 1; i < _data.servers?.length + 2; i++) {
      if (!_data.servers.find(s => s?.id === i)) return i;
    }
    return 1337;
  }

  const newServerId = getNewServerId();
  _data.servers.unshift({
    id: newServerId,
    name: serverName,
    maxPlayerCount: maxPlayerAmount,
    mafiaCount: amountOfMafia,
    playingSong: undefined,

    fillWithBots: fillWithBots,
    bots: [],

    players: [],
    initialPlayers: [],
    playerRoles: [],
    playerBlacklist: [],

    ownerId: (getUserByAst(cookies.get('ast') as unknown as string) as unknown as User)?.id,
    started: false,
    state: GameStates.Waiting,
    specialStates: {
      sheriffAbility: false,
      doctorAbility: false,
    },

    announcements: {
      [GameRoles.Mafia]: '',
      [GameRoles.Don]: '',
      [GameRoles.Citizen]: '',
      [GameRoles.Doctor]: '',
      [GameRoles.Sheriff]: '',
    },
    citizenChat: [],
    mafiaChat: [],
    playersCanChat: true,

    votingBetween: [],
    whoCanVoteKick: [],
    votes: {
      don: undefined,
      doctor: undefined,
      mafia: [],
      citizens: [],
    },
    sheriffHasChecked: [],

    totalTimerSeconds: undefined,
    timer: undefined,
  });
  _data.servers = _data.servers;

  // Don't update the servers as it causes invalidateAll() for..
  // ... the client as their socket is connected to the previous socket
  // INSTEAD: the creator/owner-user joins the server straight ahead
  // Which means the updateServers() runs
  //sendMessage('serverEvent', 'updateServers', url?.href);

  return json({ success: true, serverId: newServerId }, { status: 200 });
}

