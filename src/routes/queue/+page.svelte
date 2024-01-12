<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { auth } from "$lib/firebase/firebase.client";
  import { authStore } from "$stores/auth";
  import { LoadingSpinner, Opengraph } from "$lib/components";
  import type { ModifiedServerData } from "$types";
  import type GameServer from "$lib/server/GameServer";
  import { fade } from "svelte/transition";
  import { arrayShuffle, gameTips, queueLoadingStates } from "$lib";

  export let data: ModifiedServerData;
  $: currentServer = data.servers.find(
    (s: any) => s.id === data.currentServerId,
  ) as GameServer;
  let userDisplayName: string | undefined | null;

  function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  onMount(() => {
    const _unsubscribe = auth.onAuthStateChanged(async (user) => {
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

    let availableTips: string[] = arrayShuffle([...gameTips]),
      currentTip = "",
      nextTip = "",
      intervalTime = 2_500;

    const gameTip = document.getElementById("gameTip") as HTMLParagraphElement;
    currentTip =
      availableTips[Math.floor(Math.random() * availableTips.length)];
    availableTips.splice(availableTips.indexOf(currentTip), 1);
    gameTip.innerHTML = currentTip;

    setTimeout(async () => {
      for (let i = 0; i < 10; i++) {
        if (availableTips.length < 1)
          availableTips = arrayShuffle([...gameTips]);
        currentTip =
          nextTip ||
          availableTips[Math.floor(Math.random() * availableTips.length)];
        availableTips.splice(availableTips.indexOf(currentTip), 1);
        gameTip.innerHTML = currentTip;

        if (availableTips.length < 1)
          availableTips = arrayShuffle([...gameTips]);
        nextTip =
          availableTips[Math.floor(Math.random() * availableTips.length)];
        availableTips.splice(availableTips.indexOf(nextTip), 1);
        intervalTime = Math.floor((nextTip.length * 6_000) / 84);

        await wait(intervalTime);
      }
    }, 10);

    const queueLoadingState = document.getElementById(
      "queueLoadingState",
    ) as HTMLParagraphElement;
    (async () => {
      for (let i = 0; i < queueLoadingStates.length; i++) {
        queueLoadingState.innerHTML = queueLoadingStates[i];
        await wait(3_333);
      }

      queueLoadingState.innerHTML = "Redirecting...";
      await wait(500);

      await goto(`/game/${data.currentServerId as number}`);
    })();
  });
</script>

<div class="wrapper">
  <!-- <Header
    links={{
      Home: "/",
      Discord: "/discordLink",
    }}
    buttons={{
      Account: "/account",
    }}
    actionButtons={{}}
  /> -->

  <div class="main">
    {#if userDisplayName === null}
      <h2 style="color: #ff0000; margin: 1rem;">
        YOU CANNOT PLAY BECAUSE YOU ARE NOT LOGGED IN
      </h2>
    {/if}
    <div class="main_inner">
      <div class="top"></div>

      <div
        class="cards"
        style="display: flex; flex-direction: column; gap: 4.5rem;"
      >
        <!-- svelte-ignore a11y-missing-content -->
        <h1 id="queueLoadingState"></h1>
        <LoadingSpinner active={true} classes={[]} />
      </div>

      <div class="bottom">
        <!-- TODO: game tips -->
        <p
          style="margin-top: 10rem;"
          id="gameTip"
          transition:fade={{ delay: 250, duration: 300 }}
        ></p>
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
  <title>Queue - Mafia</title>
  <link rel="stylesheet" href="/css/game.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link
    href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100;200;300;400;500;600;700;800;900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
    rel="stylesheet"
  />
  <Opengraph />
</svelte:head>
