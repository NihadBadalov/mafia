// place files you want to import through the `$lib` alias in this folder.
import { _data, _generateUserToken } from '$api';
import type { ModifiedServerData, User, UserId } from '$types';
import { GameRoles } from '$types/GameRoles';
import { io } from '$lib/webSocketConnection';
// @ts-ignore
import washyourmouthwithsoap from 'washyourmouthoutwithsoap';
import type GameServer from './server/GameServer';

export const BotMentionRegex = new RegExp(/^(@?\d+(,\s|,|\s))+/);
export const MafiaProposalToKill= new RegExp(/lets vote for id (\d+)\. thats the guy with username \w*/);
export const SheriffProposalToKick = new RegExp(/im the sheriff. i checked .+ and his role is mafia. vote for him! \(his id is (\d+)\)/);
export const ChatVoteSystemMessage = new RegExp(/.+ \((\d+)\) voted for .+ \((\d+)\)/);
export const SheriffCondemnationMessage = new RegExp(/@(\d+) .+ is not the sheriff. i am the sheriff. he is lying. lets kick him. in all lowercase without quotes/);
export const SuspicionMessage = new RegExp(/i suspect .+ @(\d+). lets kick him out/);

export function getGameServerById(id: number, data: ModifiedServerData = _data): GameServer | undefined {
  return data.servers.find(s => s?.id === id);
}

export function createBotUsername(): string {
  return '[BOT] ' + botUsernameAdjectives[Math.floor(Math.random() * botUsernameAdjectives.length)]
    + ' ' + botUsernameNouns[Math.floor(Math.random() * botUsernameNouns.length)];
}

export const queueLoadingStates = [
  'Loading server list...',
  'Fetching server data...',
  'Connecting to the server...',
];

export const gameTips = [
  'Remember to be respectful and join the Discord server',
  'Bots can also communicate with each other and with you',
  'If you are Sheriff, you make the Doctor bot<br>heal you by saying "I\'m the Sheriff"',
  'As a Citizen, you can vote for yourself<br>and your team members',
  'If you have any questions, ask the <a href="https://discord.gg/s823fUb7VB" target="_blank">Discord server</a>',
  'It\'s better to play with your friends and real humans',
];

export const botUsernameAdjectives = [
  'Seasoned',
  'Foxy',
  'Crazy',
  'Rusty',
  'Lord',
  'Master',
  'Big',
  'Evil',
  'Cute',
  'Clever',
  'Vicious',
  'Quick',
  'Unique',
  'Proud',
];

export const botUsernameNouns = [
  'Banzai',
  'King',
  'Frank',
  'Cabbage',
  'Apfel',
  'Goblin',
  'Po',
  'Pig',
  'Gum',
  'Frog',
  'Bunny',
  'Candy',
  'Bread',
];

export function hasCurseWords(s: string) {
  return washyourmouthwithsoap.check('en', s) || washyourmouthwithsoap.check('ru', s);
}

export function updateServer(serverId: number, _io?: any) {
  (_io ?? io)?.emit('serverEvent', {
    message: 'updateServer',
    serverId: serverId,
  });
}

export function updateServers(_io?: any) {
  (_io ?? io)
    .emit(
      'serverEvent',
      { message: 'updateServers' },
    );
}

export const isMafiaGameRole = (a: number |
  typeof GameRoles[keyof typeof GameRoles] | undefined) => {
  return a === GameRoles.Mafia || a === GameRoles.Don;
};

type GameRoleGroupAlias = 'all' | 'mafia' | 'citizens';
export function gameAnnounce(
  content: string,
  includedRoles: number[] | (number | GameRoleGroupAlias | undefined),
  serverId: number,
  data: ModifiedServerData = _data,
) {
  return new Promise((res, rej) => {
    if (Number.isNaN(serverId)) return rej('Invalid server ID provided');

    const includedAnnouncementRoleIds = getIncludedRolesForGameAnnouncement(includedRoles);

    const server = data.servers.find(s => s?.id === serverId);
    if (!server) return rej('Couldn\'t find the server');

    for (let i = 0; i < includedAnnouncementRoleIds.length; i++) {
      server.announcements[includedAnnouncementRoleIds[i]] = content;
    }

    updateServer(serverId);
    res(true);
  });
}

export function getIncludedRolesForGameAnnouncement(
  inc: (typeof GameRoles[keyof typeof GameRoles])[] | number | GameRoleGroupAlias | undefined,
): number[] {
  let include = [];

  if (Array.isArray(inc)) {
    include = inc;
  }
  else if (inc === 'all') {
    include = [
      GameRoles.Unknown,
      GameRoles.Mafia,
      GameRoles.Don,
      GameRoles.Citizen,
      GameRoles.Doctor,
      GameRoles.Sheriff,
    ];
  }
  else if (inc === 'mafia') {
    include = [
      GameRoles.Mafia,
      GameRoles.Don,
    ];
  }
  else if (inc === 'citizens') {
    include = [
      GameRoles.Unknown,
      GameRoles.Citizen,
      GameRoles.Doctor,
      GameRoles.Sheriff,
    ];
  }
  else if (!Number.isNaN(inc)) {
    include = [inc as number];
  }
  else {
    include = [
      GameRoles.Unknown,
      GameRoles.Mafia,
      GameRoles.Don,
      GameRoles.Citizen,
      GameRoles.Doctor,
      GameRoles.Sheriff,
    ];
  }

  return include;
}

/*
* Get a random value of an Enum
*/
export function randomEnumValue<T extends object>(enumeration: T | any): T[keyof T] {
  const numberEnumValues = Object.keys(enumeration).filter(k => !Number.isNaN(+k)) as unknown as T[keyof T][];
  return numberEnumValues[Math.floor(Math.random() * numberEnumValues.length)];
}

export function arrayShuffle(array: any[]) {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

export function getFullEndpointUrl(endpointPath: string, currentLocationHref: string): string {
  // Parse the current location.href
  const url = new URL(currentLocationHref);

  // Check if there's a subdomain
  const subdomain = url.hostname.split('.')[0];

  // WARNING: next line, "|| true" at the end
  // works though!
  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1' || true;

  let fullApiUrl = '';

  if (isLocalhost) {
    // If localhost, use 'http://localhost:port'
    fullApiUrl = `${url.protocol}//${url.hostname}:${url.port}`;
  } else {
    // Otherwise, use 'http(s)://(www. - if there is a subdomain)host.domain'
    const domain = url.hostname.split('.').slice(1).join('.');
    const protocol = url.protocol === 'https:' ? 'https:' : 'http:';
    const www = subdomain === 'www' ? 'www.' : '';
    fullApiUrl = `${protocol}//${www}${domain}`;
  }

  // Combine with the endpoint path
  fullApiUrl += endpointPath;

  return fullApiUrl;
}

export function getUserRoleInServer(id: UserId | undefined, data?: ModifiedServerData) {
  let server = getGameServerWithUserById(id, data);
  if (!server) return;

  if (!server.started) return;

  let role = server.playerRoles.find(pr => pr.userId === id);
  return role?.role;
}

export function getGameServerWithUserByAst(ast: string | unknown | undefined, data: ModifiedServerData = _data): GameServer | undefined {
  let user = getUserByAst(ast) as unknown as User;
  if (!user) return;

  let server = data.servers.find(s => s.players.includes(user.id));
  if (!server) return;

  return server;
}

export function getGameServerWithUserById(id: number | string | undefined, data: ModifiedServerData = _data): GameServer | undefined {
  let user = getUserById(id, data) as unknown as User;
  if (!user) return;

  let server = data.servers.find(s => s.players.includes(user.id));
  if (!server) return;

  return server;
}

export function getUserByAst(ast: string | unknown | undefined, data: ModifiedServerData = _data): User | undefined {
  if (typeof (ast) == 'undefined') return undefined;
  if (!ast) return undefined;

  const userId = data?.userAsts?.find(u => u.token === ast)?.id;
  if (!userId) return;

  const user = data.users.find(u => u.id === userId);
  return user;
}

export function getUserById(id: number | string | undefined, data: ModifiedServerData = _data): User | undefined {
  if (Number.isNaN(id)) return;

  let user = data.users.find(u => u?.id === id);
  return user;
}

