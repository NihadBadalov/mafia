import { redirect, error } from '@sveltejs/kit';
import { handleUserSession } from '$lib';
import type { GameServer } from '$types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (async ({ fetch, params, cookies }) => {
  const response = await fetch('/api/servers');
  const data = await response.json();

  if (!data || !data?.servers)
    throw error(500, 'Server error: Couldn\'t fetch servers');

  const currentUserId = await handleUserSession(cookies, fetch, data.endpoint);

  // Servers
  const servers: GameServer[] = data.servers;

  if (!params?.id || isNaN(params?.id as any))
    throw error(404, 'Couldn\'t find the server');

  if (!servers.find(s => s.id === +params.id))
    throw redirect(307, '/');

  const currentServer = servers.find(s => s.id === +params.id) as GameServer;
  return {
    ...data,
    currentServerId: currentServer.id,
    currentUserId,
    ast: cookies.get('ast'),
  };
});

