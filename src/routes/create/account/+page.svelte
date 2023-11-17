<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { Opengraph } from "$lib/components";
  import { auth } from "$lib/firebase/firebase.client";
  import { authHandlers, authStore } from "$stores/auth";
  import type { UserAccessToken } from "$types";
  import { onMount } from "svelte";

  export let form: any;
  export let data: { ast: UserAccessToken };

  onMount(async () => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      authStore.update((curr) => {
        return {
          ...curr,
          isLoading: false,
          currentUser: user,
          currentUsername:
            typeof form?.username === "string"
              ? form?.username
              : curr?.currentUsername,
        };
      });

      if ($authStore.currentUser) {
        await goto("/account");
      }
    });
  });

  let register = true;
  let username = "";
  let email = "";
  let password = "";
  let confirmPassword = "";
  $: headingText = register ? "Create an Account" : "Log In";
  $: buttonText = register ? "SIGN UP" : "LOG IN";

  let formError = "";
  $: if (form?.missing) {
    formError = "One of the fields is missing!";
  } else if (form?.incorrect) {
    if (form?.username) {
      formError = form?.curseWords
        ? "Username contains curse words"
        : "Username is too short! (min. 5 characters)";
    } else if (form?.email) {
      formError = form?.zod
        ? "Email format is incorrect!"
        : "Email is incorrect!";
    } else if (form?.password) {
      formError = "Password is too short! (min. 8 characters)";
    } else if (form?.confirmPassword) {
      formError = "Confirmation password is incorrect!";
    } else {
      formError = "One of the fields is incorrect!";
    }
  } else if (form?.serverError) {
    // Error codes can be found here: https://firebase.google.com/docs/reference/js/auth#autherrorcodes
    if (form?.errorCode === "auth/invalid-login-credentials") {
      formError = "Wrong password";
    } else if (form?.errorCode === "auth/too-many-requests") {
      formError = "Rate limit exceeded: too many attempts";
    } else if (form?.errorCode === "auth/email-already-in-use") {
      formError = "Email is already in use";
    } else {
      formError =
        "Server error: couldn't create the account.<br />Please submit a bug request to the developers! :)";
    }
  }

  function handleAccountCreation() {
    return async ({ result, update }: { result: any; update: any }) => {
      if (
        result?.data?.registering !== undefined &&
        result?.data?.email &&
        result?.data?.password
      ) {
        await authHandlers.login(result?.data?.email, result?.data?.password);
        await goto("/account");
      } else {
        update();
      }
    };
  }

  async function loginWithGoogle() {
    await authHandlers.loginWithGoogle(data?.ast, fetch);
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
        >Account</button
      >
    </div>
  </div>

  <div class="main">
    <div class="main_inner">
      <form
        class="create_account"
        method="POST"
        use:enhance={handleAccountCreation}
      >
        <h1>
          Welcome{!register ? " back" : ""}!<br /><span>{headingText}</span>
        </h1>

        {#if register}
          <p style="width: 30%; text-align: left; margin-bottom: -1em;">
            Username
          </p>
          <input
            bind:value={username}
            type="text"
            autocomplete="off"
            placeholder="Enter your username"
            name="username"
            minlength="5"
            required
          />
        {/if}

        <p style="width: 30%; text-align: left; margin-bottom: -1em;">Email</p>
        <input
          bind:value={email}
          type="email"
          autocomplete="off"
          placeholder="Enter your email"
          name="email"
          required
        />

        <p style="width: 30%; text-align: left; margin-bottom: -1em;">
          Password
        </p>
        <input
          bind:value={password}
          type="password"
          autocomplete="off"
          placeholder="Enter you password"
          name="password"
          minlength="6"
          required
        />

        {#if register}
          <p style="width: 30%; text-align: left; margin-bottom: -1em;">
            Confirm Password
          </p>
          <input
            bind:value={confirmPassword}
            type="password"
            autocomplete="off"
            placeholder="Confirm your password"
            name="confirmPassword"
            minlength="8"
            required
          />
        {/if}

        <button class="btn" type="submit">
          {buttonText}
        </button>

        <p>OR</p>

        <button
          class="btn"
          id="btn_google"
          on:click={async () => await loginWithGoogle()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 488 512"
          >
            <style>
              svg {
                fill: #ffffff;
              }
            </style><path
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            /></svg
          >
          <span>CONTINUE WITH <bold>GOOGLE</bold></span>
        </button>

        {#if register}
          <p id="action_call">
            <i
              >Don't miss out on: <span>Friends, XP, Skilled Matchmaking</span
              >.<i /></i
            >
          </p>

          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
          <p
            on:click={() => {
              register = !register;
              formError = "";
            }}
          >
            <i
              class={form?.errorCode === "auth/email-already-in-use"
                ? "bold underline important"
                : ""}
              >Already have an account? <span class="fake_link">Log In</span>
            </i>
          </p>
        {:else}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
          <p
            on:click={() => {
              register = !register;
              formError = "";
            }}
          >
            <i>Don't have an account? <span class="fake_link">Sign Up</span></i>
          </p>
        {/if}

        <p style="color: #ff6060; font-weight: 600;">
          {@html formError}
        </p>
      </form>
    </div>

    <footer>
      <a href="/discordLink">Our Discord Server</a>
      <a href="/terms">Terms of Service</a>
      <a href="/privacy">Privacy Policy</a>
    </footer>
  </div>
</div>

<svelte:head>
  <title>Create Account - Mafia</title>
  <link rel="stylesheet" href="/css/createAccount.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link
    href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100;200;300;400;500;600;700;800;900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
    rel="stylesheet"
  />
  <Opengraph />
</svelte:head>
