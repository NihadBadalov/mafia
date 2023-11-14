<script lang="ts">
  import type { PageData } from "./$types";
  import { goto } from "$app/navigation";
  import { ServerList, Header } from "$lib/components";
  import { invalidateAll } from "$app/navigation";

  export let data: PageData;
  $: ({ servers } = data);

  import { customIo, socketEndpoint } from "$lib/webSocketConnection.js";
  import { onMount } from "svelte";
  const io = customIo(`${socketEndpoint}/main`);

  onMount(() => {
    io.on("serverEvent", async (message) => {
      if (message !== "updateServers") return;
      invalidateAll();
    });
  });
</script>

<svelte:head>
  <title>Main - Mafia</title>
  <link rel="stylesheet" href="/css/styles.css" />
  <link rel="stylesheet" href="/css/serverList.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link
    href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100;200;300;400;500;600;700;800;900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="wrapper">
  <Header
    links={{
      Home: "/",
      Servers: "/servers",
      Discord: "/discordLink",
    }}
    buttons={{
      Account: "/account",
    }}
  />

  <div class="main">
    <div class="main_inner">
      <ServerList data={{ servers: servers }} />
      <div class="menu_buttons">
        <button
          class="btn"
          id="btn_join_random"
          on:click={() => goto("/random")}
        >
          Join a random game
        </button>
        <button
          class="btn"
          id="btn_join_random"
          on:click={() => goto("/create/server")}>Create a game</button
        >
        <button class="btn" id="btn_servers" on:click={() => goto("/servers")}>
          Servers
        </button>
        <button class="btn" id="btn_servers" on:click={() => goto("/guide")}>
          Guide
        </button>
      </div>
    </div>

    <footer>
      <a href="/discordLink">Our Discord Server</a>
      <a href="/terms">Terms of Service</a>
      <a href="/privacy">Privacy Policy</a>
    </footer>
  </div>
</div>
