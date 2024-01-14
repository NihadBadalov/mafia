import { gameAnnounce, getUserRoleInServer, isMafiaGameRole } from "$lib";
import { io } from "$lib/webSocketConnection";
import { _data } from "$routes/api";
import { GameStates } from "$types/GameStates";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { setTimeout as sleep } from 'timers/promises';

export const POST: RequestHandler = async ({ request, params }) => {
  const { origin } = await request.json();

  if (origin !== _data.serverPassphrase)
    throw error(403, 'Not Authorized');

  if (!params?.id || isNaN(params?.id as any))
    throw error(404, 'Couldn\'t find the server');

  const serverId = +params?.id;
  const server = _data.servers.find(s => s.id === serverId)!;
  if (!server) throw error(404, 'Couldn\'t find the server');

  // Check if appropriate player amount to start the server
  if (!server.started)
    throw error(403, 'Not Authorized');

  const endVotePlayerRoles = server.players.map(pid => isMafiaGameRole(getUserRoleInServer(pid)));
  if (!(endVotePlayerRoles.filter(e => e).length === 0
    || endVotePlayerRoles.filter(e => e).length >= endVotePlayerRoles.filter(e => !e).length))
    throw error(403, 'Not Authorized');


  server.state = GameStates.Ended;

  if (endVotePlayerRoles.filter(e => e).length === 0) {
    // Citizens won
    await gameAnnounce(
      'CITIZENS <span class="color_red">WON!</span>',
      'all',
      serverId,
    );
  }
  else {
    // Mafias won
    await gameAnnounce(
      'MAFIAS <span class="color_red">WON!</span>',
      'all',
      serverId,
    );
  }

  await sleep(20_000);

  _data.servers = _data.servers.filter(s => s.id !== serverId);

  io.emit('serverEvent', {
    message: 'gameEndRedirect',
    serverId: serverId,
  });


  // @ts-expect-error Yeah
  return json({}, { statusCode: 200 });
}
