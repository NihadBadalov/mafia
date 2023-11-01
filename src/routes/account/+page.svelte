<script>
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { auth } from "$lib/firebase/firebase.client";
  import { authStore } from "$stores/authStore";
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
      <button class="btn" id="btn_account">Account</button>
      <button class="btn" id="btn_log_out">Log Out</button>
    </div>
  </div>
  <div class="main">
    <form class="main_inner" method="POST" use:enhance>
      <div class="create_server">
        <h1>Welcome!<br />Create an Account</h1>
      </div>
    </form>

    <footer>
      <a href="/discordLink">Our Discord Server</a>
      <a href="/terms">Terms of Service</a>
      <a href="/privacy">Privacy Policy</a>
    </footer>
  </div>
</div>
