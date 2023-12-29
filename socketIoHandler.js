import { Server } from 'socket.io';

/**
  * @param endpointPath {string}
  * @param currentLocationHref {string}
  */
function getFullEndpointUrl(endpointPath, currentLocationHref) {
  const url = new URL(currentLocationHref);
  let fullApiUrl = '';
  fullApiUrl = `${url.protocol}//${url.hostname}:${url.port}`;
  fullApiUrl += endpointPath;
  return fullApiUrl;
}

/**
  * @param io {Server}
  */
function updateServers(io) {
  io.of('/main').emit('serverEvent', 'updateServers');
  io.of('/servers').emit('serverEvent', 'updateServers');
}


/**
  * @type {Array<any>}
  * Array of Sockets
  */
const sockets = [];
/**
  * @param server {Partial<import('socket.io').ServerOptions>}
  */
export default function injectSocketIO(server) {
  const io = new Server(server);
  // All namespaces
  const allNamespaces = io.of(/\/.*/);

  allNamespaces.on('connection', (socket) => {
    sockets.push(socket);
    socket.join('lobby');

    socket.on('fallbackEvent', async ({ message: event, endpoint }) => {
      // joinServer from client
      if (!event) return;

      switch (event) {
        case 'du':
          // Delete user
          break;

        default:
          break;
      }
    });

    socket.on('indexedSocket', async ({
      serverId,
      serverStarted,
      successful,
      role,
    }) => {
      if (isNaN(serverId) || isNaN(role)) return;
      if (!serverStarted || !successful) return;

      if (role === 0 || role === 1 || role === 2) {
        // Mafia team
        socket.join('mafias');
      }
      else {
        // Citizens team
        socket.join('citizens');
      }

    });

    socket.on('joinServer', async ({ message, endpoint }) => {
      // joinServer from client
      const { serverId, userId, ast, fbs } = message;
      if (isNaN(serverId)) return;

      const response = await fetch(
        getFullEndpointUrl(`/api/servers/${serverId}/join`, endpoint),
        {
          method: 'POST',
          body: JSON.stringify({
            userId: userId,
            ast: ast,
            fbs: fbs,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        io.of(`/game/${serverId}`).emit('serverEvent', 'updateServerOnClient');
        socket.emit('serverEvent', 'refreshPage');
      }
    });

    socket.on('leaveServer', async ({ message, endpoint }) => {
      // leaveServer from client
      const { serverId, userId, ast } = message;
      if (isNaN(serverId)) return;

      const response = await fetch(
        getFullEndpointUrl(`/api/servers/${serverId}/leave`, endpoint),
        {
          method: 'POST',
          body: JSON.stringify({
            userId: userId,
            ast: ast,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        io.of(`/game/${serverId}`).emit('serverEvent', 'updateServerOnClient');
      }
    });

    socket.on('serverEvent', async ({ message: eventName, ...args }) => {
      if (!eventName) return;

      switch (eventName) {
        case 'updateServers':
          updateServers(io);
          break;

        case 'updateServer':
          if (!args?.serverId) return;
          io.of(`/game/${args?.serverId}`).emit('serverEvent', 'updateServerOnClient');
          break;

        case 'indexSocketsFromServer':
          if (isNaN(args['serverId'])) return;
          io.of(`/game/${args['serverId']}`).emit('serverEvent', 'indexSockets');
          break;

        case 'gameEndRedirect':
          if (isNaN(args['serverId'])) return;
          io.of(`/game/${args['serverId']}`).emit('serverEvent', 'redirectToMainPage');
          break;

        case 'playSound':
          if (!args?.soundName || isNaN(args?.serverId)) return;
          io.of(`/game/${args['serverId']}`).emit('playSound', args.soundName);
          break;

        case 'playSong':
          if (!args?.songName || isNaN(args?.serverId)) return;
          io.of(`/game/${args['serverId']}`).emit('playSong', args.songName);
          break;

        case 'playEffect':
          if (!args?.soundName || isNaN(args?.serverId)) return;
          io.of(`/game/${args['serverId']}`).emit('playEffect', args.soundName);
          break;

        case 'chatMessageFromServerToServer':
          if (args?.to === undefined
            || !args?.serverId
            || !args?.userId
            || !args?.content) return;

          let emitContent = {
            // iT being innerText
            iT1: '<p class="chatMessage">',
            iT2: args?.content ?? '',
            iT3: '</p>',
            userId: args?.userId,
          };

          switch (args?.to) {
            case 2:
              // All
              io.of(`/game/${args?.serverId}`).emit('chatMessageToClient', emitContent);
              break;

            case 0:
              // Mafia
              io.of(`/game/${args?.serverId}`).to('mafias').emit('chatMessageToClient', emitContent);
              break;

            case 1:
              // Citizens
              io.of(`/game/${args?.serverId}`).to('citizens').emit('chatMessageToClient', emitContent);
              break;
          }

        default:
          break;
      }
    });

    socket.on('disconnecting', async () => {
      sockets.splice(sockets.indexOf(socket), 1);
      socket.emit('fallbackEvent', 'dU');
    });


    // Servers stuff
    socket.on('startServer', async ({ message, endpoint }) => {
      const { serverId, userId, ast } = message;
      if (isNaN(serverId)) return;

      const response = await fetch(
        getFullEndpointUrl(`/api/servers/${serverId}/start`, endpoint),
        {
          method: 'POST',
          body: JSON.stringify({
            userId: userId,
            ast: ast,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const responseJson = await response.json();
      if (response.ok && responseJson) {
        //setTimeout(() => {
        io.of(`/game/${serverId}`).emit('serverEvent', 'updateServerOnClient');
        //}, 2000);
      }
    });
  });

  console.log('SocketIO injected');
}
