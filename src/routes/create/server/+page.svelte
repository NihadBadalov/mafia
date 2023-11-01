<svelte:head>
    <title>Create Server - Mafia</title>
    <link rel="stylesheet" href="/src/lib/css/createServer.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100;200;300;400;500;600;700;800;900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">
</svelte:head>

<script lang="ts">
    //import type { PageData } from './$types';
    import { goto } from '$app/navigation';
    import { enhance } from '$app/forms';

    //export let data: PageData;
    export let form: any;

    import { io } from '$lib/webSocketConnection.js';
    import { onMount } from 'svelte';

    onMount(() => {
        io.on('message', (message) => {
            // Message from server
            console.log('Message from server', message);
        });
    });

    let _playerAmount = form?.maxPlayerAmount as any as number ?? 6;
    $: _minMafiaAmount = Math.floor(_playerAmount / 4) - 1 || 1;
    $: _maxMafiaAmount = Math.ceil(_playerAmount / 3);
    $: _mafiaAmount = form?.amountOfMafia as any as number ?? _minMafiaAmount;

    $: if (_playerAmount < 6 || _playerAmount > 16) {
		_playerAmount = _playerAmount < 6 ? _playerAmount : 16;
	}
    $: if (_mafiaAmount < _minMafiaAmount || _mafiaAmount > _maxMafiaAmount) {
		_mafiaAmount = _mafiaAmount < _minMafiaAmount ? _minMafiaAmount : _maxMafiaAmount;
	}
</script>

<div class="wrapper">
    <div class="header">
        <div>
            <h1 class="serif_font">
                <a href="/"
                style="color: #fff; text-decoration: none;">
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
                <h1>Create a Server</h1>

                <p style="width: 30%; text-align: left; margin-bottom: -1em;">Name of the Server</p>
                <input value={form?.serverName ?? ''} name="serverName" type="text" autocomplete="off" placeholder="Name of the Server" minlength=3 maxlength=20 required>

                <p style="width: 30%; text-align: left; margin-bottom: -1em;">Amount of Players (6-16)</p>
                <input bind:value={_playerAmount} name="maxPlayerAmount" type="number" autocomplete="off" placeholder="Amount of Players (6-16)" min=6 max=16 required>

                <p id="mafiaAmount_text" style="width: 30%; text-align: left; margin-bottom: -1em;">Amount of Mafia ({_minMafiaAmount}-{_maxMafiaAmount})</p>
                <input bind:value={_mafiaAmount} id="mafiaAmount_input" name="amountOfMafia" type="number" autocomplete="off" placeholder="Amount of Mafia ({_minMafiaAmount}-{_maxMafiaAmount})" min={_minMafiaAmount} max={_maxMafiaAmount} required>

                <button class="btn" id="btn_create" type='submit'>Create</button>

                {#if form?.missing}
                    <p style="color: #ff6060; font-weight: 600;">One of the fields is missing!</p>
                {:else if form?.incorrect}
                    <p style="color: #ff6060; font-weight: 600;">One of the fields is incorrect!</p>
                {:else if form?.serverError}
                    <p style="color: #ff6060; font-weight: 600;">Server error: couldn't create a server.</p>
                {/if}
            </div>

            <div class="menu_buttons">
                <button class="btn" id="btn_join_random" on:click={() => goto('/random')}>Join a random game</button>
            </div>
        </form>

        <footer>
            <a href="/discordLink">Our Discord Server</a>
            <a href="/terms">Terms of Service</a>
            <a href="/privacy">Privacy Policy</a>
        </footer>
    </div>
</div>

