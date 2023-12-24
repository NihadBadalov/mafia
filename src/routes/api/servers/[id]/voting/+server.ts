import { error, type RequestHandler } from '@sveltejs/kit';
import { _data } from '$api';
import type { GameServer } from '$types';
import { GameStates } from '$types/GameStates';
import { io } from '$lib/webSocketConnection';
import { day } from './day';
import { night } from './night';


export const POST: RequestHandler = async ({ request, params }) => {
  let { origin, votingBetween, passedDonChoice } = await request.json();

  if (origin !== _data.serverPassphrase)
    throw error(403, 'Not Authorized');

  if (!params?.id || isNaN(params?.id as any))
    throw error(404, 'Couldn\'t find the server');

  let serverId = +params?.id;
  let server = _data.servers.find(s => s.id === serverId) as GameServer;
  if (!server) throw error(404, 'Couldn\'t find the server');

  // Check if appropriate player amount to start the server
  if (!server.started)
    throw error(403, 'Not Authorized');


  if (server.state === GameStates.Day) {
    return await day(
      server,
      io,
      votingBetween
    );
  }
  else {
    return await night(
      server,
      io,
      votingBetween,
      passedDonChoice
    );
  }
}

