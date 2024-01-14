import { redirect, error } from '@sveltejs/kit';
import { handleUserSession } from '$lib/server';
import type GameServer from "$lib/server/GameServer";
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (async ({ fetch, params, cookies }) => {
  const response = await fetch('/api/servers');
  const data = await response.json();

  if (!data?.servers)
    throw error(500, 'Server error: Couldn\'t fetch servers');

  const currentUserId = await handleUserSession(cookies, fetch, data.endpoint);

  // Servers
  const servers: GameServer[] = data.servers;

  if (!params?.id || isNaN(params?.id as any))
    throw redirect(307, '/');

  if (!servers.find(s => s.id === +params.id))
    throw redirect(307, '/');

  const currentServer = servers.find(s => s.id === +params.id)!;
  return {
    ...data,
    currentServerId: currentServer.id,
    currentUserId,
    ast: cookies.get('ast'),
    fbs: cookies.get('fbs') ?? '',
    userIsInServer: currentServer.players.indexOf(currentUserId!) !== -1,
  };
});

