import { c as create_ssr_component, v as validate_component } from "../../chunks/ssr.js";
import { S as ServerList } from "../../chunks/ServerList.js";
import "../../chunks/index4.js";
import { c as customIo, s as socketEndpoint } from "../../chunks/webSocketConnection.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let servers;
  let { data } = $$props;
  customIo(`${socketEndpoint}/main`);
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  ({ servers } = data);
  return `${$$result.head += `<!-- HEAD_svelte-pzlot7_START -->${$$result.title = `<title>Main - Mafia</title>`, ""}<link rel="stylesheet" href="/src/lib/css/styles.css"><link rel="stylesheet" href="/src/lib/css/serverList.css"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""><link href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100;200;300;400;500;600;700;800;900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet"><!-- HEAD_svelte-pzlot7_END -->`, ""} <div class="wrapper"><div class="header"><div data-svelte-h="svelte-k8azry"><h1 class="serif_font"><a href="/" style="color: #fff; text-decoration: none;">MAFIA — Online Card Game</a></h1></div> <nav data-svelte-h="svelte-uai8dw"><a class="nav_link" href="/">Home</a> <a class="nav_link" href="/servers">Servers</a> <a class="nav_link" href="/discordLink">Discord</a></nav> <div class="header_actions"><button class="btn" id="btn_account" data-svelte-h="svelte-niatp8">Account</button></div></div> <div class="main"><div class="main_inner">${validate_component(ServerList, "ServerList").$$render($$result, { data: { servers } }, {}, {})} <div class="menu_buttons"><button class="btn" id="btn_join_random" data-svelte-h="svelte-1vjhxa0">Join a random game</button> <button class="btn" id="btn_join_random" data-svelte-h="svelte-2v9nak">Create a game</button> <button class="btn" id="btn_servers" data-svelte-h="svelte-yx2lfh">Servers</button> <button class="btn" id="btn_servers" data-svelte-h="svelte-1a0ncul">Guide</button></div></div> <footer data-svelte-h="svelte-mtt87"><a href="/discordLink">Our Discord Server</a> <a href="/terms">Terms of Service</a> <a href="/privacy">Privacy Policy</a></footer></div></div>`;
});
export {
  Page as default
};
