import { s as subscribe } from "../../../../chunks/utils.js";
import { c as create_ssr_component, e as escape, a as add_attribute, b as each, o as onDestroy, v as validate_component } from "../../../../chunks/ssr.js";
import { c as customIo, s as socketEndpoint } from "../../../../chunks/webSocketConnection.js";
import { G as GameRoles, c as getUserById, i as isMafiaGameRole, b as getUserRoleInServer } from "../../../../chunks/index3.js";
import "../../../../chunks/index4.js";
import "../../../../chunks/firebase.client.js";
import { a as authStore } from "../../../../chunks/auth.js";
import { G as GameStates } from "../../../../chunks/GameStates.js";
function getImagePath(pR) {
  let path = "/images/card";
  switch (pR) {
    case 1:
      path += "_mafia.jpg";
      break;
    case 2:
      path += "_don.jpg";
      break;
    case 3:
      path += "_citizen.jpg";
      break;
    case 4:
      path += "_doctor.jpg";
      break;
    case 5:
      path += "_sheriff.jpg";
      break;
    default:
      path += ".png";
      break;
  }
  return path;
}
const PlayerCard = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  let { ownUserId } = $$props;
  let { ast } = $$props;
  let { serverId } = $$props;
  let { playerId } = $$props;
  let { playerName } = $$props;
  let { playerRole = void 0 } = $$props;
  let { ownCard = false } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  if ($$props.ownUserId === void 0 && $$bindings.ownUserId && ownUserId !== void 0)
    $$bindings.ownUserId(ownUserId);
  if ($$props.ast === void 0 && $$bindings.ast && ast !== void 0)
    $$bindings.ast(ast);
  if ($$props.serverId === void 0 && $$bindings.serverId && serverId !== void 0)
    $$bindings.serverId(serverId);
  if ($$props.playerId === void 0 && $$bindings.playerId && playerId !== void 0)
    $$bindings.playerId(playerId);
  if ($$props.playerName === void 0 && $$bindings.playerName && playerName !== void 0)
    $$bindings.playerName(playerName);
  if ($$props.playerRole === void 0 && $$bindings.playerRole && playerRole !== void 0)
    $$bindings.playerRole(playerRole);
  if ($$props.ownCard === void 0 && $$bindings.ownCard && ownCard !== void 0)
    $$bindings.ownCard(ownCard);
  return ` <div role="link" tabindex="0" class="${"card card_" + escape(playerId, true) + " " + escape(ownCard ? "ownCard" : "", true)}"><img${add_attribute("src", getImagePath(playerRole), 0)} alt="Card"> <p><!-- HTML_TAG_START -->${playerName}<!-- HTML_TAG_END --></p></div>`;
});
const Chat = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let disableSending;
  let { data } = $$props;
  let { messages = [] } = $$props;
  let { userId = 0 } = $$props;
  let { ast } = $$props;
  let { serverId } = $$props;
  let formInputPlaceholder = "Enter your message";
  let _server = data.servers.find((s) => s.id === serverId);
  let form;
  let formInput;
  const cache = {};
  function fetchUser(uid) {
    cache[uid] = getUserById(uid, data)?.name ?? "Unnamed user";
    if (uid === userId)
      cache[uid] = cache[uid] === "Unnamed user" ? cache[uid] : `<span class="color_red">${cache[uid]} (YOU)</span>`;
    if (isMafiaGameRole(getUserRoleInServer(uid, data)))
      cache[uid] = `<span class="color_red">[MAFIA]</span> ${cache[uid]}`;
    return cache[uid];
  }
  for (let i = 0; i < (_server?.players.length ?? messages.length); i++) {
    if (cache[_server?.players.length ? _server.players[i] : messages[i]?.userId])
      continue;
    fetchUser(_server?.players.length ? _server.players[i] : messages[i]?.userId);
  }
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  if ($$props.messages === void 0 && $$bindings.messages && messages !== void 0)
    $$bindings.messages(messages);
  if ($$props.userId === void 0 && $$bindings.userId && userId !== void 0)
    $$bindings.userId(userId);
  if ($$props.ast === void 0 && $$bindings.ast && ast !== void 0)
    $$bindings.ast(ast);
  if ($$props.serverId === void 0 && $$bindings.serverId && serverId !== void 0)
    $$bindings.serverId(serverId);
  disableSending = false;
  {
    {
      let s = data.servers.find((s2) => s2.id === serverId);
      let pr = s?.playerRoles.find((pr2) => pr2?.userId === userId);
      if (pr && s?.state === GameStates.Night && !(pr?.role === GameRoles.Mafia || pr?.role === GameRoles.Don)) {
        disableSending = true;
        formInputPlaceholder = "You currently can not send messages";
      } else {
        formInputPlaceholder = "Enter your message";
      }
    }
  }
  return `<div class="game_chat"><p data-svelte-h="svelte-1cwnydq">Chat</p> <form class="game_chat__inner game_chat__controls" method="POST"${add_attribute("this", form, 0)}><input name="msg" type="text"${add_attribute("placeholder", formInputPlaceholder, 0)} autocomplete="off" ${disableSending ? "disabled" : ""}${add_attribute("this", formInput, 0)}> ${!disableSending ? `<button type="submit" data-svelte-h="svelte-ah9bu5">Send</button>` : ``}</form> <div class="game_chat__inner game_chat__contents"><div class="game_chat__inner__message_holder">${each(messages, (message) => {
    return `<p class="${"chatMessage " + escape(userId === message.userId ? "ownMessage" : "", true)}"><!-- HTML_TAG_START -->${cache[message?.userId]}<!-- HTML_TAG_END -->:
          ${escape(message.content)} </p>`;
  })}</div></div></div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let currentServer;
  let gameStarted;
  let citizenChat;
  let mafiaChat;
  let $$unsubscribe_authStore;
  $$unsubscribe_authStore = subscribe(authStore, (value) => value);
  let { data } = $$props;
  const io = customIo(`${socketEndpoint}/game/${data.currentServerId}`);
  function sendMessage(event, text) {
    io.emit(event, { message: text, endpoint: data?.endpoint });
  }
  onDestroy(() => {
  });
  sendMessage("joinServer", {
    serverId: data.currentServerId,
    userId: data.currentUserId,
    ast: data.ast
  });
  function getPlayerNameById(pId) {
    let u = data.users.find((u2) => u2.id === pId);
    return u?.name + (u?.id === data?.currentUserId ? ' <span class="color_red">(YOU)</span>' : "");
  }
  const currentUserIsMafia = () => {
    let role = currentServer.playerRoles.find((pr) => pr.userId === data?.currentUserId)?.role;
    return role === GameRoles.Mafia || role === GameRoles.Don;
  };
  const getCurrentUserRoleId = () => {
    if (!gameStarted)
      return 0;
    return currentServer.playerRoles.find((pr) => pr.userId === data?.currentUserId)?.role ?? 0;
  };
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  currentServer = data.servers.find((s) => s.id === data.currentServerId);
  gameStarted = currentServer.started;
  citizenChat = currentServer.citizenChat;
  mafiaChat = currentServer.mafiaChat;
  $$unsubscribe_authStore();
  return `<audio src="/audios/gong.mp3" id="gameSound"></audio> <audio src="/audios/gong.mp3" id="gameSong"></audio> <div class="wrapper"><div class="header"><div data-svelte-h="svelte-k8azry"><h1 class="serif_font"><a href="/" style="color: #fff; text-decoration: none;">MAFIA — Online Card Game</a></h1></div> <nav data-svelte-h="svelte-10xf5ml"><a class="nav_link" href="/">Home</a> <a class="nav_link" href="/discordLink">Discord</a></nav> <div class="header_actions"><button class="btn" id="btn_account" data-svelte-h="svelte-ue98m6">Account</button></div></div> <div class="main"><div class="main_inner"><div class="top">${!gameStarted ? `${currentServer.players.length < 6 ? `<h1>WAITING FOR PLAYERS... ${escape(currentServer.players.length)}/${escape(currentServer.maxPlayerCount)}</h1>` : `<h1 data-svelte-h="svelte-1gxvvj7">WAITING FOR THE SESSION-CREATOR TO START...</h1> ${currentServer.ownerId == data.currentUserId ? `<button class="btn" id="btn_start_game" data-svelte-h="svelte-1eu41c">START GAME</button>` : ``}`}` : ``} <h1 class="announcementText">${escape(currentServer.timer ? `${currentServer.timer} - ` : "")} <!-- HTML_TAG_START -->${currentServer.announcements[getCurrentUserRoleId()] ?? ""}<!-- HTML_TAG_END --></h1></div> <div class="cards">${each(currentServer.players, (playerId) => {
    return `${playerId === data?.currentUserId ? `${validate_component(PlayerCard, "PlayerCard").$$render(
      $$result,
      {
        data,
        playerId,
        playerName: getPlayerNameById(playerId),
        playerRole: currentServer.playerRoles.find((pr) => pr.userId === playerId)?.role,
        ownCard: true,
        ownUserId: data?.currentUserId,
        ast: data?.ast,
        serverId: data?.currentServerId
      },
      {},
      {}
    )}` : `${(currentServer.playerRoles.find((pr) => pr.userId === data?.currentUserId)?.role === GameRoles.Mafia || currentServer.playerRoles.find((pr) => pr.userId === data?.currentUserId)?.role === GameRoles.Don) && (currentServer.playerRoles.find((pr) => pr.userId === playerId)?.role === GameRoles.Mafia || currentServer.playerRoles.find((pr) => pr.userId === playerId)?.role === GameRoles.Don) ? `${validate_component(PlayerCard, "PlayerCard").$$render(
      $$result,
      {
        data,
        playerId,
        playerName: getPlayerNameById(playerId),
        playerRole: currentServer.playerRoles.find((pr) => pr.userId === playerId)?.role,
        ownUserId: data?.currentUserId,
        ast: data?.ast,
        serverId: data?.currentServerId
      },
      {},
      {}
    )}` : `${validate_component(PlayerCard, "PlayerCard").$$render(
      $$result,
      {
        data,
        playerId,
        playerName: getPlayerNameById(playerId),
        ownUserId: data?.currentUserId,
        ast: data?.ast,
        serverId: data?.currentServerId
      },
      {},
      {}
    )}`}`}`;
  })}</div> <div class="bottom">${validate_component(Chat, "Chat").$$render(
    $$result,
    {
      data,
      messages: currentUserIsMafia() ? mafiaChat : citizenChat,
      userId: data?.currentUserId,
      ast: data?.ast,
      serverId: data?.currentServerId
    },
    {},
    {}
  )}</div></div> <footer><a href="/discordLink" data-svelte-h="svelte-1d4ms6y">Our Discord Server</a> <a href="/terms" data-svelte-h="svelte-1w2skkd">Terms of Service</a> <a href="/privacy" data-svelte-h="svelte-1i82s7b">Privacy Policy</a> <p style="display: none;" id="currentUserIdP">${escape(data.currentUserId)}</p></footer></div></div> ${$$result.head += `<!-- HEAD_svelte-18cj566_START -->${$$result.title = `<title>${escape(currentServer.name || "Game")} - Mafia</title>`, ""}<link rel="stylesheet" href="/src/lib/css/game.css"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""><link href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100;200;300;400;500;600;700;800;900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet"><script defer data-svelte-h="svelte-1kt4089">/* const audioElement = document.querySelector("audio");
    let audioCtx;
    if (!audioCtx) audioCtx = new AudioContext();

    const gainNode = new GainNode(audioCtx);
    const panner = new StereoPannerNode(audioCtx, { pan: 0 });

    window.onload = function () {
      setTimeout(() => {
        audioElement.play();
      }, 3000);
    }; */

    /* window.addEventListener("DOMContentLoaded", (event) => {
      let currentUserId = document.querySelector("#currentUserIdP");
      let playerCard = document.querySelector(
        \`.card_\${currentUserId.innerText}\`
      );
      // console.log(playerCard);
    }); */<\/script><!-- HEAD_svelte-18cj566_END -->`, ""}`;
});
export {
  Page as default
};
