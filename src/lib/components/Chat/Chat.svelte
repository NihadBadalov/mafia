<script lang="ts">
  import { getUserById, getUserRoleInServer, isMafiaGameRole } from "$lib";
  import type { ChatMessage, ModifiedServerData } from "$types";
  import { onMount } from "svelte";
  import { GameStates } from "$types/GameStates";
  import { GameRoles } from "$types/GameRoles";

  export let data: ModifiedServerData;
  export let messages: ChatMessage[] = [];
  export let userId: number = 0;
  export let ast: string;
  export let serverId: number;
  let formInputPlaceholder = "Enter your message";
  let _server = data.servers.find((s) => s.id === serverId);
  $: disableSending = false;
  $: {
    let s = data.servers.find((s) => s.id === serverId);
    let pr = s?.playerRoles.find((pr) => pr?.userId === userId);

    if (
      pr &&
      s?.state === GameStates.Night &&
      !(pr?.role === GameRoles.Mafia || pr?.role === GameRoles.Don)
    ) {
      disableSending = true;
      formInputPlaceholder = "You currently can not send messages";
    } else {
      formInputPlaceholder = "Enter your message";
    }
  }

  // Message sending
  let form: any;
  let formInput: HTMLInputElement;
  async function submitReplaceState(e: SubmitEvent) {
    e.preventDefault();

    const message = formInput.value;

    formInput.focus();
    formInput.value = "";

    await fetch(`/api/servers/${serverId}/gameChat`, {
      method: "POST",
      body: JSON.stringify({
        message,
        userId,
        ast,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    } as RequestInit);
  }

  onMount(() => {
    formInput?.focus();
  });

  // User ids and names
  const cache: { [key: string]: string } = {
    [-1]: '<span class="color_yellow">[SYSTEM]</span>',
  };

  function fetchUser(uid: number) {
    cache[uid] =
      getUserById(uid, data as ModifiedServerData)?.name ?? "Unnamed user";

    if (uid === userId)
      cache[uid] =
        cache[uid] === "Unnamed user"
          ? cache[uid]
          : `<span class="color_red">${cache[uid]} (YOU)</span>`;

    if (isMafiaGameRole(getUserRoleInServer(uid, data)))
      cache[uid] = `<span class="color_red">[MAFIA]</span> ${cache[uid]}`;

    return cache[uid];
  }

  for (let i = 0; i < (_server?.players.length ?? messages.length); i++) {
    if (
      cache[
        _server?.players.length
          ? _server.players[i]
          : (messages[i]?.userId as any)
      ]
    )
      continue;

    fetchUser(
      _server?.players.length
        ? _server.players[i]
        : (messages[i]?.userId as any),
    );
  }
</script>

<div class="game_chat">
  <p>Chat</p>
  <form
    class="game_chat__inner game_chat__controls"
    method="POST"
    bind:this={form}
    on:submit|preventDefault={submitReplaceState}
  >
    <input
      name="msg"
      type="text"
      placeholder={formInputPlaceholder}
      autocomplete="off"
      bind:this={formInput}
      disabled={disableSending}
    />

    {#if !disableSending}
      <button type="submit">Send</button>
    {/if}
  </form>

  <div class="game_chat__inner game_chat__contents">
    <div class="game_chat__inner__message_holder">
      {#each messages as message}
        <p class="chatMessage {userId === message.userId ? 'ownMessage' : ''}">
          {#if message.userId === -1}
            <!-- System message -->
            <span class="italic">
              {@html cache[message?.userId]}:
              {@html message.content}
            </span>

          {:else}
            <!-- Normal message -->
            {@html cache[message?.userId]}:
            {message.content}
          {/if}
        </p>
      {/each}
    </div>
  </div>
</div>
