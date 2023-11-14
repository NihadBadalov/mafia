<script lang="ts">
  import { goto } from "$app/navigation";
  import { auth } from "$lib/firebase/firebase.client";
  import { authHandlers, authStore } from "$stores/auth";
  import { onMount } from "svelte";
  import { Header, LoadingSpinner } from "$lib/components";
  import type { User } from "firebase/auth";
  import type { User as DataUser } from "$types";

  export let data: {
    currentUser: DataUser;
    currentUsername: string | null;
  };
  let user: User;

  onMount(async () => {
    const unsubscribe = auth.onAuthStateChanged(async (usr) => {
      authStore.update((curr) => {
        return { ...curr, isLoading: false, currentUser: usr };
      });

      if (!usr || (!$authStore.currentUser && !$authStore.isLoading)) {
        await goto("/create/account");
      }

      user = usr!;
    });
  });

  async function logOut() {
    await authHandlers.logout();
  }

  $: userJoinDate = !isNaN(new Date(user?.metadata?.creationTime!).getDay())
    ? new Intl.DateTimeFormat("en-CA", {
        dateStyle: "short",
      })?.format(new Date(user?.metadata?.creationTime!))
    : null;
</script>

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
    actionButtons={{
      'Log Out': logOut,
    }}
  />

  <div class="main">
    {#if user}
      <div class="main_inner" style="display: {user ? 'flex' : 'none'};">
        <div class="account">
          <h1>Your Account</h1>
          <div class="account_details">
            <img src={user.photoURL} alt="Account" class="account__pfp" />

            <div class="account__info">
              <div class="top">
                <span class="presence">Online</span>
              </div>

              <div class="bottom">
                <p>
                  {user.displayName ??
                    data?.currentUsername ??
                    data.currentUser.name}
                  <span class="account__id"
                    >ID: {data?.currentUser?.id ?? 0}</span
                  >
                </p>
              </div>
            </div>

            <div class="account__stats">
              <div>
                <p>Joined:<br />{userJoinDate}</p>
              </div>
              <div>
                <p>Winrate:<br />0.7 (70%)</p>
              </div>
              <div>
                <p>Games:<br />123</p>
              </div>
            </div>

            <div class="account__last_games">
              <div>
                <span>W/L</span>
                <p class="game__server_name">Server Name</p>
                <p class="game__player_role">Player Role</p>
                <p class="game__player_amount">Player Amount</p>
              </div>
              <div>
                <span>L</span>
                <p class="game__server_name">Wazzup boyz</p>
                <p class="game__player_role">Mafia</p>
                <p class="game__player_amount">6</p>
              </div>
              <div>
                <span>L</span>
                <p class="game__server_name">Wazzup boyz</p>
                <p class="game__player_role">Mafia</p>
                <p class="game__player_amount">6</p>
              </div>
              <div>
                <span>L</span>
                <p class="game__server_name">Wazzup boyz</p>
                <p class="game__player_role">Mafia</p>
                <p class="game__player_amount">6</p>
              </div>
              <div>
                <span>L</span>
                <p class="game__server_name">Wazzup boyz</p>
                <p class="game__player_role">Mafia</p>
                <p class="game__player_amount">6</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Spinner -->
    {:else}
      <div
        class="main_inner spinner"
        style="display: {!user ? 'flex' : 'none'};"
      >
        <LoadingSpinner active={!user} classes={[]} />
      </div>
    {/if}

    <footer>
      <a href="/discordLink">Our Discord Server</a>
      <a href="/terms">Terms of Service</a>
      <a href="/privacy">Privacy Policy</a>
    </footer>
  </div>
</div>

<svelte:head>
  <title>Account - Mafia</title>
  <link rel="stylesheet" href="/css/account.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link
    href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100;200;300;400;500;600;700;800;900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
    rel="stylesheet"
  />
</svelte:head>
