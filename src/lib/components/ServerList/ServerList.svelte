<script lang="ts">
    // import { goto } from '$app/navigation';
    export let data: any;
    export let title: string = '';
</script>

<div class="server_list">
    <ul>
        {#if title}
        <h1 style="width: 100%; text-align: center; margin-bottom: 0.3em;">{title}</h1>
        {/if}
        <li>
            <p class="server_id">ID</p>
            <p class="server_players">PLAYERS</p>
            <p class="server_mafia_count">MAFIA COUNT</p>
            <p class="server_name">SERVER NAME</p>
        </li>
        {#each data.servers as {id, name, maxPlayerCount, mafiaCount, players}, i}
        <a class="server_{id}" href="/game/{id}">
            <p class="server_id">{id}</p>
            <p class="server_players">{players.length}/{maxPlayerCount}</p>
            <p class="server_mafia_count">{mafiaCount}</p>
            <p class="server_name">{name}</p>
        </a>
        {/each}
        {#if !data.servers.length}
        <h1 style="width: 100%; text-align: center; margin-top: 3em; color: #c0c0c0;">NO ACTIVE SERVERS</h1>
        {/if}
    </ul>
</div>

