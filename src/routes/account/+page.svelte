<script lang="ts">
  import { goto } from "$app/navigation";
  import { auth } from "$lib/firebase/firebase.client";
  import { authHandlers, authStore } from "$stores/authStore";
  import { onMount } from "svelte";

  onMount(async () => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      authStore.update((curr) => {
        return { ...curr, isLoading: false, currentUser: user };
      });

      if (!$authStore.currentUser && !$authStore.isLoading) {
        await goto("/create/account");
      }
    });
  });

  async function logOut() {
    await authHandlers.logout();
  }
</script>

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
      <button class="btn" id="btn_account" on:click={() => goto("/account")}
        >Account
      </button>
      <button class="btn" id="btn_log_out" on:click={async () => logOut()}
        >Log Out</button
      >
    </div>
  </div>

  <div class="main">
    <div class="main_inner" />

    <footer>
      <a href="/discordLink">Our Discord Server</a>
      <a href="/terms">Terms of Service</a>
      <a href="/privacy">Privacy Policy</a>
    </footer>
  </div>
</div>

<svelte:head>
  <title>Account - Mafia</title>
  <link rel="stylesheet" href="/src/lib/css/account.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link
    href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100;200;300;400;500;600;700;800;900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
    rel="stylesheet"
  />
</svelte:head>
