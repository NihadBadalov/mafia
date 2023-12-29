<script lang="ts">
  import { customIo, socketEndpoint } from "$lib/webSocketConnection.js";
  import { onDestroy, onMount } from "svelte";
  import { goto, invalidateAll } from "$app/navigation";
  import { GameRoles } from "$types/GameRoles";
  import { getUserById, getUserRoleInServer, isMafiaGameRole } from "$lib";
  import { auth } from "$lib/firebase/firebase.client";
  import { authStore } from "$stores/auth";
  import { PlayerCard, Chat, Opengraph } from "$lib/components";
  import type { GameServer, ModifiedServerData, User } from "$types";
  import { GameStates } from "$types/GameStates";
  import { Header } from "$lib/components";

  export let data: ModifiedServerData;
  $: currentServer = data.servers.find(
    (s: any) => s.id === data.currentServerId,
  ) as GameServer;
  $: gameStarted = currentServer.started;
  $: citizenChat = currentServer.citizenChat;
  $: mafiaChat = currentServer.mafiaChat;
  $: gameState = "";
  $: {
    switch (currentServer.state) {
      case GameStates.Waiting:
        gameState = "WAITING FOR PLAYERS";
        break;

      case GameStates.Ended:
        gameState =
          "THE GAME ENDED! YOU WILL BE REDIRECTED TO THE LOBBY SHORTLY<br>THANKS FOR PLAYING!";
        break;

      case GameStates.Day:
        if (
          currentServer.players.length === currentServer.votingBetween.length &&
          currentServer.players.every(
            (val, ind) => val === currentServer.votingBetween[ind],
          )
        )
          gameState = "VOTE-KICK VOTING";
        break;

      case GameStates.Night:
        if (currentServer.specialStates.doctorAbility) {
          gameState = "DOCTOR IS CHOOSING WHOM TO KEEP ALIVE";
        } else if (currentServer.specialStates.sheriffAbility) {
          gameState = "SHERIFF IS CHOOSING WHOSE ROLE TO VIEW";
        } else {
          gameState = "MAFIA IS CHOOSING WHO TO KILL";
        }
        break;

      default:
        break;
    }
  }
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
      // Just ignore because it floods the console
      // Because it simply errors on sound interrupt
      // console.log(e);
    }
  }

  function playEffect(soundName: string) {
    const audioElement: HTMLAudioElement | null =
      document.querySelector("#gameEffect");
    if (!audioElement) return;
    audioElement.volume = 0.02;
    audioElement.src = `/audios/${soundName}.mp3`;
    try {
      audioElement.play();
    } catch (e) {
      // Just ignore because it floods the console
      // Because it simply errors on sound interrupt
      // console.log(e);
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
      // Just ignore because it floods the console
      // Because it simply errors on sound interrupt
      // console.log(e);
    }
  }

  onMount(() => {
    if (currentServer?.playingSong) {
      setTimeout(() => {
        playSong(currentServer.playingSong as string);
      }, 2_000);
    }

    io.on("fallbackEvent", (message) => {
      sendMessage("fallbackEvent", message);
    });

    io.on("playSound", (soundName) => {
      playSound(soundName);
    });

    io.on("playSong", (songName) => {
      playSong(songName);
    });

    io.on("playEffect", (songName) => {
      playEffect(songName);
    });

    io.on("chatMessageToClient", ({ iT1, iT2, iT3, userId }) => {
      /*
      Quick summary on why we cannot use sounds for in-game messages:

      The reason is
      that svelte reactivity updates faster than the WS (idk how and why)
      which is why it cannot play an audio
      */
      let chat = document.querySelector(
        ".game_chat > .game_chat__contents > .game_chat__inner__message_holder",
      );
      if (!chat) return;

      console.log(`clientmsg: ${iT1} ${iT2} ${iT3} ${userId}`);
      let p = null;
      p = document.createElement("p");

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
        case "updateServerOnClient":
          invalidateAll();
          break;

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
                (pr) => pr?.userId === data?.currentUserId,
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

      userDisplayName = user?.displayName ?? undefined;

      if (!$authStore.currentUser && !$authStore.isLoading) {
        // Redirect user to account creation page if not logged in
        // and is the one creating the server
        if (currentServer.players.length === 0) {
          await goto(`/create/account?ref=/game/${currentServer.id}`);
        }
        userDisplayName = null;
      }
    });

    sendMessage("joinServer", {
      serverId: data.currentServerId,
      userId: data.currentUserId,
      ast: data.ast,
      fbs: data?.fbs,
    });
  });

  onDestroy(() => {
    io.disconnect();
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

  const leaveServer = () =>
    sendMessage("leaveServer", {
      serverId: data.currentServerId,
      userId: data.currentUserId,
      ast: data.ast,
    });

  const currentUserIsMafia = () => {
    let role = currentServer.playerRoles.find(
      (pr) => pr.userId === data?.currentUserId,
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
<audio src="/audios/gong.mp3" id="gameEffect" />

<div class="wrapper">
  <Header
    links={{
      Home: "/",
      Discord: "/discordLink",
    }}
    buttons={{
      Account: "/account",
    }}
    actionButtons={data.userIsInServer
      ? {
          Leave: leaveServer,
        }
      : {}}
  />

  <div class="main">
    {#if userDisplayName === null}
      <h2 style="color: #ff0000; margin: 1rem;">
        YOU CANNOT PLAY IN THIS SERVER BECAUSE YOU ARE NOT LOGGED IN
      </h2>
    {/if}
    <h2 class="gameStateText">{@html gameState}</h2>
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
          {currentServer.timer !== undefined &&
          currentServer.totalTimerSeconds !== undefined
            ? `${currentServer.timer}/${currentServer.totalTimerSeconds} - `
            : ""}
          {@html currentServer.announcements[getCurrentUserRoleId()] ?? ""}
        </h1>
      </div>

      <div class="cards">
        {#if currentServer.state != GameStates.Ended}
          {#each currentServer.players as playerId}
            {#if playerId === data?.currentUserId}
              <PlayerCard
                {data}
                {playerId}
                playerName={getPlayerNameById(playerId)}
                playerRole={currentServer.playerRoles.find(
                  (pr) => pr.userId === playerId,
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
                  (pr) => pr.userId === playerId,
                )?.role}
                ownUserId={data?.currentUserId}
                ast={data?.ast}
                serverId={data?.currentServerId}
              />
            {:else}
              <PlayerCard
                {data}
                {playerId}
                playerRole={currentServer.playerRoles.find(
                  (pr) => pr.userId === playerId,
                )?.role}
                playerName={getPlayerNameById(playerId)}
                ownUserId={data?.currentUserId}
                ast={data?.ast}
                serverId={data?.currentServerId}
              />
            {/if}
          {/each}
        {:else}
          <!-- Game ended -->
          {#each currentServer.initialPlayers as playerId}
            <PlayerCard
              {data}
              {playerId}
              playerName={getPlayerNameById(playerId)}
              playerRole={currentServer.playerRoles.find(
                (pr) => pr.userId === playerId,
              )?.role}
              ownUserId={data?.currentUserId}
              ast={data?.ast}
              serverId={data?.currentServerId}
            />
          {/each}
        {/if}
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
  <link rel="stylesheet" href="/css/game.css" />
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
  <Opengraph />
</svelte:head>
