import { c as create_ssr_component, e as escape, b as each } from "./ssr.js";
const ServerList = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  let { title = "" } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  return `<div class="server_list"><ul>${title ? `<h1 style="width: 100%; text-align: center; margin-bottom: 0.3em;">${escape(title)}</h1>` : ``} <li data-svelte-h="svelte-1a7056a"><p class="server_id">ID</p> <p class="server_players">PLAYERS</p> <p class="server_mafia_count">MAFIA COUNT</p> <p class="server_name">SERVER NAME</p></li> ${each(data.servers, ({ id, name, maxPlayerCount, mafiaCount, players }, i) => {
    return `<a class="${"server_" + escape(id, true)}" href="${"/game/" + escape(id, true)}"><p class="server_id">${escape(id)}</p> <p class="server_players">${escape(players.length)}/${escape(maxPlayerCount)}</p> <p class="server_mafia_count">${escape(mafiaCount)}</p> <p class="server_name">${escape(name)}</p> </a>`;
  })} ${!data.servers.length ? `<h1 style="width: 100%; text-align: center; margin-top: 3em; color: #c0c0c0;" data-svelte-h="svelte-1vgyjvh">NO ACTIVE SERVERS</h1>` : ``}</ul></div>`;
});
export {
  ServerList as S
};
