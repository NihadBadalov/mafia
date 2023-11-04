<script lang="ts">
  import { customIo, socketEndpoint } from "$lib/webSocketConnection.js";
  import { onDestroy, onMount } from "svelte";
  import { goto, invalidateAll } from "$app/navigation";
  import { GameRoles } from "$types/GameRoles";
  import { getUserById, getUserRoleInServer, isMafiaGameRole } from "$lib";
  import { auth } from "$lib/firebase/firebase.client";
  import { authStore } from "$stores/auth";
  import { PlayerCard, Chat } from "$lib/components";
  import type { GameServer, ModifiedServerData, User } from "$types";

  export let data: ModifiedServerData;
  $: currentServer = data.servers.find(
    (s: any) => s.id === data.currentServerId
  ) as GameServer;
  $: gameStarted = currentServer.started;
  $: citizenChat = currentServer.citizenChat;
  $: mafiaChat = currentServer.mafiaChat;
  let userDisplayName: string | undefined | null;

  const io = customIo(`${socketEndpoint}/game/${data.currentServerId}`);

  // Send message to server
  function sendMessage(event: string, text: string | object) {
    io.emit(event, { message: text, endpoint: data?.endpoint });
  }

  // User ids and names
  const cache: { [key: string]: string } = {};

  function playSound(soundName: string) {
    const audioElement: HTMLAudioElement | null =
      document.querySelector("#gameSound");
    if (!audioElement) return;
    audioElement.volume = 0.02;
    audioElement.src = `/audios/${soundName}.mp3`;
    try {
      audioElement.play();
    } catch (e) {
      console.log(e);
    }
  }

  function playSong(songName: string) {
    const audioElement: HTMLAudioElement | null =
      document.querySelector("#gameSong");
    if (!audioElement) return;
    audioElement.volume = 0.02;
    audioElement.src = `/audios/${songName}.mp3`;
    try {
      audioElement.play();
    } catch (e) {
      console.log(e);
    }
  }

  onMount(() => {
    io.on("fallbackEvent", (message) => {
      sendMessage("fallbackEvent", message);
    });

    io.on("playSound", (soundName) => {
      playSound(soundName);
    });

    io.on("playSong", (songName) => {
      playSong(songName);
    });

    io.on("chatMessageToClient", ({ iT1, iT2, iT3, userId }) => {
      /*
      Quick summary on why we cannot use sounds for in-game messages:

      Actually, scrap everything below. The reason is
      that svelte reactivity updates faster than the WS (idk how and why)
      which is why it cannot play an audio

      - "chatMessageToClient" WS Event is only for messages written
      during GameStates.Waiting 

      Since:

      - Updating in-game messages is done through svelte's reactivity;
      this happens due to consistent updateServer WS Events happening
      throughout the whole gameplay. For example, the timers (which are
      also consistent)

      But there are no frequent updateServer WSEs during the Waiting state
      hence why the message updating during Waiting is done through WSEs.
      This means that we are able to emit the event of incoming messages
      with the "chatMessageToClient" WSE, but not the in-game ones, as
      the updating is made using svelte's reactivity.

      A possible workaround would be to not use "$:" for chat messages
      and instead use currentServer.mafia/citizenChat after checking
      whether or not the current player is a Mafia.
      And after that you simply start debugging the WS part of
      real-time messages
      */
      let chat = document.querySelector(
        ".game_chat > .game_chat__contents > .game_chat__inner__message_holder"
      );
      if (!chat) return;

      let p = document.createElement("p");

      function fetchUser(uid: number) {
        cache[uid] =
          getUserById(uid, data as ModifiedServerData)?.name ?? "Unnamed user";

        if (data?.currentUserId === uid)
          cache[uid] =
            cache[uid] === "Unnamed user"
              ? cache[uid]
              : `<span class="color_red">${cache[uid]} (YOU)</span>`;

        if (isMafiaGameRole(getUserRoleInServer(uid, data)))
          cache[uid] = `<span class="color_red">[MAFIA]</span> ${cache[uid]}`;

        return cache[uid];
      }

      let innerText =
        iT1 + (cache[userId] ?? fetchUser(userId)) + ": " + iT2 + iT3;

      p.innerHTML = innerText;
      if (userId === data?.currentUserId) p.classList.add("ownMessage");

      chat.append(p);
      playSound("beep");
    });

    io.on("serverEvent", async (message) => {
      // Message from server
      switch (message) {
        case "updateServer":
          invalidateAll();
          break;

        // TODO: check if joining a server works without refreshing afterwards
        case "refreshPage":
          invalidateAll();
          break;

        case "redirectToMainPage":
          goto("/");
          break;

        case "indexSockets":
          setTimeout(() => {
            io.emit("indexedSocket", {
              serverId: data?.currentServerId,
              serverStarted: currentServer?.started,
              successful: !!currentServer?.started,
              role: currentServer.playerRoles.find(
                (pr) => pr?.userId === data?.currentUserId
              )?.role,
            });
          }, 1000);
          break;

        default:
          break;
      }
    });

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      authStore.update((curr) => {
        return { ...curr, isLoading: false, currentUser: user };
      });

      if (!$authStore.currentUser && !$authStore.isLoading) {
        await goto("/create/account");
      }

      userDisplayName = user?.displayName;
    });
  });

  onDestroy(() => {
    // Left the session
    /**
        TODO: some inactivity system

        sendMessage('leaveServer', {
            serverId: data.currentServerId,
            userId: data.currentUserId,
            ast: data.ast,
        });
        */
  });

  sendMessage("joinServer", {
    serverId: data.currentServerId,
    userId: data.currentUserId,
    ast: data.ast,
  });

  function getPlayerNameById(pId: number): string {
    let u = data.users.find((u: User) => u.id === pId);
    return (
      (u?.name as string) +
      (u?.id === data?.currentUserId
        ? ' <span class="color_red">(YOU)</span>'
        : "")
    );
  }

  const startGame = () =>
    sendMessage("startServer", {
      serverId: data.currentServerId,
      userId: data.currentUserId,
      ast: data.ast,
    });

  const currentUserIsMafia = () => {
    let role = currentServer.playerRoles.find(
      (pr) => pr.userId === data?.currentUserId
    )?.role;
    return role === GameRoles.Mafia || role === GameRoles.Don;
  };
  const getCurrentUserRoleId = () => {
    if (!gameStarted) return 0;
    return (
      currentServer.playerRoles.find((pr) => pr.userId === data?.currentUserId)
        ?.role ?? 0
    );
  };
</script>

<audio src="/audios/gong.mp3" id="gameSound" />
<audio src="/audios/gong.mp3" id="gameSong" />

<div class="wrapper">
  <div class="header">
    <div>
      <h1 class="serif_font">
        <a href="/" style="color: #fff; text-decoration: none;">
          MAFIA — Online Card Game
        </a>
      </h1>
    </div>
    <nav>
      <a class="nav_link" href="/">Home</a>
      <a class="nav_link" href="/discordLink">Discord</a>
    </nav>
    <div class="header_actions">
      <button class="btn" id="btn_account" on:click={() => goto('/account')}>Account</button>
    </div>
  </div>
  <div class="main">
    <div class="main_inner">
      <div class="top">
        {#if !gameStarted}
          {#if currentServer.players.length < 6}
            <h1>
              WAITING FOR PLAYERS... {currentServer.players
                .length}/{currentServer.maxPlayerCount}
            </h1>
          {:else}
            <h1>WAITING FOR THE SESSION-CREATOR TO START...</h1>

            {#if currentServer.ownerId == data.currentUserId}
              <button
                class="btn"
                id="btn_start_game"
                on:click={() => startGame()}
              >
                START GAME
              </button>
            {/if}
          {/if}
        {/if}
        <h1 class="announcementText">
          {currentServer.timer ? `${currentServer.timer} - ` : ""}
          {@html currentServer.announcements[getCurrentUserRoleId()] ?? ""}
        </h1>
      </div>

      <div class="cards">
        {#each currentServer.players as playerId}
          {#if playerId === data?.currentUserId}
            <PlayerCard
              {data}
              {playerId}
              playerName={getPlayerNameById(playerId)}
              playerRole={currentServer.playerRoles.find(
                (pr) => pr.userId === playerId
              )?.role}
              ownCard
              ownUserId={data?.currentUserId}
              ast={data?.ast}
              serverId={data?.currentServerId}
            />
          {:else if (currentServer.playerRoles.find((pr) => pr.userId === data?.currentUserId)?.role === GameRoles.Mafia || currentServer.playerRoles.find((pr) => pr.userId === data?.currentUserId)?.role === GameRoles.Don) && (currentServer.playerRoles.find((pr) => pr.userId === playerId)?.role === GameRoles.Mafia || currentServer.playerRoles.find((pr) => pr.userId === playerId)?.role === GameRoles.Don)}
            <PlayerCard
              {data}
              {playerId}
              playerName={getPlayerNameById(playerId)}
              playerRole={currentServer.playerRoles.find(
                (pr) => pr.userId === playerId
              )?.role}
              ownUserId={data?.currentUserId}
              ast={data?.ast}
              serverId={data?.currentServerId}
            />
          {:else}
            <PlayerCard
              {data}
              {playerId}
              playerName={getPlayerNameById(playerId)}
              ownUserId={data?.currentUserId}
              ast={data?.ast}
              serverId={data?.currentServerId}
            />
          {/if}
        {/each}
      </div>

      <div class="bottom">
        {#key currentServer.state}
          <Chat
            {data}
            messages={currentUserIsMafia() ? mafiaChat : citizenChat}
            userId={data?.currentUserId}
            ast={data?.ast}
            serverId={data?.currentServerId}
          />
        {/key}
      </div>
    </div>

    <footer>
      <a href="/discordLink">Our Discord Server</a>
      <a href="/terms">Terms of Service</a>
      <a href="/privacy">Privacy Policy</a>
      <p style="display: none;" id="currentUserIdP">
        {data.currentUserId}
      </p>
    </footer>
  </div>
</div>

<svelte:head>
  <title>{currentServer.name || "Game"} - Mafia</title>
  <link rel="stylesheet" href="/src/lib/css/game.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link
    href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100;200;300;400;500;600;700;800;900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
    rel="stylesheet"
  />

  <script defer>
    /* const audioElement = document.querySelector("audio");
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
        `.card_${currentUserId.innerText}`
      );
      // console.log(playerCard);
    }); */
  </script>
</svelte:head>
