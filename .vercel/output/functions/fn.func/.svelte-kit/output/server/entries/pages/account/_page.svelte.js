import { s as subscribe } from "../../../chunks/utils.js";
import { c as create_ssr_component, e as escape, v as validate_component } from "../../../chunks/ssr.js";
import "../../../chunks/firebase.client.js";
import { a as authStore } from "../../../chunks/auth.js";
import "../../../chunks/index4.js";
import "../../../chunks/webSocketConnection.js";
const LoadingSpinner = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { active } = $$props;
  let { classes } = $$props;
  if ($$props.active === void 0 && $$bindings.active && active !== void 0)
    $$bindings.active(active);
  if ($$props.classes === void 0 && $$bindings.classes && classes !== void 0)
    $$bindings.classes(classes);
  return `<div class="${"loading-spinner " + escape(classes.join(" "), true)}" style="${"display: " + escape(active ? "block" : "none", true) + ";"}"><div></div> <div></div> <div></div> <div></div></div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_authStore;
  $$unsubscribe_authStore = subscribe(authStore, (value) => value);
  let { data } = $$props;
  let user;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  !isNaN(new Date(user?.metadata?.creationTime).getDay()) ? new Intl.DateTimeFormat("en-CA", { dateStyle: "short" })?.format(new Date(user?.metadata?.creationTime)) : null;
  $$unsubscribe_authStore();
  return `<div class="wrapper"><div class="header"><div data-svelte-h="svelte-k8azry"><h1 class="serif_font"><a href="/" style="color: #fff; text-decoration: none;">MAFIA — Online Card Game</a></h1></div> <nav data-svelte-h="svelte-10xf5ml"><a class="nav_link" href="/">Home</a> <a class="nav_link" href="/discordLink">Discord</a></nav> <div class="header_actions"><button class="btn" id="btn_account" data-svelte-h="svelte-1ulabks">Account</button> <button class="btn" id="btn_log_out" data-svelte-h="svelte-egastc">Log Out</button></div></div> <div class="main">${`<div class="main_inner spinner" style="${"display: " + escape("flex", true) + ";"}">${validate_component(LoadingSpinner, "LoadingSpinner").$$render($$result, { active: !user, classes: [] }, {}, {})}</div>`} <footer data-svelte-h="svelte-mtt87"><a href="/discordLink">Our Discord Server</a> <a href="/terms">Terms of Service</a> <a href="/privacy">Privacy Policy</a></footer></div></div> ${$$result.head += `<!-- HEAD_svelte-ha3b01_START -->${$$result.title = `<title>Account - Mafia</title>`, ""}<link rel="stylesheet" href="/src/lib/css/account.css"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""><link href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100;200;300;400;500;600;700;800;900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet"><!-- HEAD_svelte-ha3b01_END -->`, ""}`;
});
export {
  Page as default
};
