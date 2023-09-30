<script lang="ts">
  import type { PageData } from "./$types";
  import { goto } from "$app/navigation";
  import { ServerList } from "$lib/components";
  import { invalidateAll } from "$app/navigation";
  import { dev } from "$app/environment";

  export let data: PageData;
  $: ({ servers } = data);

  import { customIo, socketEndpoint } from "$lib/webSocketConnection.js";
  import { onMount } from "svelte";

  const io = customIo(`${socketEndpoint}/main`);

  onMount(() => {
    io.on("message", (message) => {
      // Message from server
      console.log("Message from server", message);
    });
    io.on("serverEvent", async (message) => {
      // Message from server
      if (message !== "updateServers") return;

      invalidateAll();
    });
  });
</script>

<svelte:head>
  <title>Main - Mafia</title>
  <link rel="stylesheet" href="/src/lib/css/styles.css" />
  <link rel="stylesheet" href="/src/lib/css/serverList.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link
    href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100;200;300;400;500;600;700;800;900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<audio src="/audios/gong.mp3" style="" />

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
      <a class="nav_link" href="/servers">Servers</a>
      <a class="nav_link" href="/discordLink">Discord</a>
    </nav>
    <div class="header_actions">
      <button class="btn" id="btn_account">Account</button>
      <button class="btn" id="btn_log_out">Log Out</button>
    </div>
  </div>
  <div class="main">
    <div class="main_inner">
      <ServerList data={{ servers: servers }} />
      <div class="menu_buttons">
        <button
          class="btn"
          id="btn_join_random"
          on:click={() => goto("/random")}>Join a random game</button
        >
        <button
          class="btn"
          id="btn_join_random"
          on:click={() => goto("/create")}>Create a game</button
        >
        <button class="btn" id="btn_servers" on:click={() => goto("/servers")}
          >Servers</button
        >
        <button class="btn" id="btn_servers" on:click={() => goto("/guide")}
          >Guide</button
        >
      </div>
    </div>

    <footer>
      <a href="/discordLink">Our Discord Server</a>
      <a href="/terms">Terms of Service</a>
      <a href="/privacy">Privacy Policy</a>
    </footer>
  </div>

  <script>
    // for legacy browsers

    let AudioContext;
    let audio;
    let context;
    let source;
    document.addEventListener("click", function () {
      AudioContext ??= window.AudioContext || window.webkitAudioContext;
      audio ??= document.querySelector("audio");
      context ??= new AudioContext();
      source ??= context.createMediaElementSource(audio);
      if (context.state === "suspended") {
        context.resume();
      }
      audio.play();
    });
  </script>
</div>
