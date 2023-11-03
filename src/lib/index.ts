// place files you want to import through the `$lib` alias in this folder.
import { _data, _generateUserToken } from '$api';
import type { GameServer, ModifiedServerData, User, UserId } from '$types';
import { dev } from '$app/environment';
import type { Cookies } from '@sveltejs/kit';
import { GameRoles } from '$types/GameRoles';
import { io } from '$lib/webSocketConnection';
import { auth } from './firebase/firebase.client';

function updateServer(serverId: number) {
  io.emit('serverEvent', {
    message: 'updateServer',
    serverId: serverId,
  });
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

/*
    * Handle user session, if user doesn't have one
*/
export async function handleUserSession(cookies: Cookies, fetch: any, endpoint: string) {
  // User session
  if (!cookies.get('ast')
    || !cookies.get('ast')?.length
    || !getUserByAst(cookies.get('ast')! as string)) {
    // Not in session 
    const fbs = cookies.get('fbs');
    // const firebaseUser = await auth.verify
    const username = `User ${Math.round(Math.random() * 999999)}`;
    const userToken = _generateUserToken(30);

    const response = await fetch(getFullEndpointUrl('/api/users', endpoint), {
      method: 'POST',
      body: JSON.stringify({
        event: 'createUser',
        username: username,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const userCreationData = await response.json();

    _data?.userAsts?.push({
      id: userCreationData?.id,
      token: userToken,
    });
    try {
      cookies.set('ast', userToken, {
        path: '/',
        secure: !dev,
      });
    } catch {
    }
  }
  return getUserByAst(cookies.get('ast'))?.id;
}
