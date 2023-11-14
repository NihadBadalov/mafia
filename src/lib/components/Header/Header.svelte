<script>
  /**
   * @type {{ [key: string]: string; }};
   */
  export let links;

  /**
   * @type {{ [key: string]: string; }};
   */
  export let buttons;

  import { goto } from "$app/navigation";
</script>

<div class="header">
  <div>
    <h1 class="serif_font">
      <a href="/" style="color: #fff; text-decoration: none;">
        MAFIA — Online Card Game
      </a>
    </h1>
  </div>
  <nav>
    {#each Object.entries(links) as [name, location]}
      <a class="nav_link" href={location}>{name}</a>
    {/each}
  </nav>
  <div class="header_actions">
    {#each Object.entries(buttons) as [name, location]}
      <button class="btn" id="btn_account" on:click={() => goto(location)}>
        {name}
      </button>
    {/each}
  </div>
</div>
