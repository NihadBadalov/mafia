<script lang="ts">
  import type { ModifiedServerData } from "$types";
  export let data: ModifiedServerData;

  export let ownUserId: number;
  export let ast: string;
  export let serverId: number;

  export let playerId: string | number;
  export let playerName: string;
  // number from GameRoles or 0 for a default card image
  export let playerRole: any = undefined;
  export let ownCard: boolean = false;

  function getImagePath(pR: any) {
    let path = "/images/card";
    switch (pR) {
      case 1:
        path += "_mafia.jpg";
        break;

      case 2:
        path += "_don.jpg";
        break;

      case 3:
        path += "_citizen.jpg";
        break;

      case 4:
        path += "_doctor.jpg";
        break;

      case 5:
        path += "_sheriff.jpg";
        break;

      default:
        path += ".png";
        break;
    }

    return path;
  }
  async function keyboardVote(
    e: KeyboardEvent & {
      currentTarget: EventTarget & HTMLDivElement;
    },
  ) {
    if (e.key !== "Enter" && e.key !== "Space") return;
    await vote();
  }

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

  async function vote() {
    // Sheriff abilities
    const voteEndpoint = data.servers.find((s) => s.id === serverId)
      ?.specialStates?.sheriffAbility
      ? "sheriffAbility"
      : data.servers.find((s) => s.id === serverId)?.specialStates
            ?.doctorAbility
        ? "doctorAbility"
        : "vote";

    const response = await fetch(`/api/servers/${serverId}/${voteEndpoint}`, {
      method: "POST",
      body: JSON.stringify({
        targetUserId: playerId,
        userId: ownUserId,
        ast: ast,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    } as RequestInit);

    if (!response?.ok) {
      playSound("wronganswer");
    } else {
      playSound("beep2");
    }
  }
</script>

<div
  on:click={() => vote()}
  on:keyup={async (e) => await keyboardVote(e)}
  role="link"
  tabindex="0"
  class="card card_{playerId} {ownCard ? 'ownCard' : ''}"
>
  <img src={getImagePath(playerRole)} alt="Card" />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <p>{@html playerName}</p>
</div>
