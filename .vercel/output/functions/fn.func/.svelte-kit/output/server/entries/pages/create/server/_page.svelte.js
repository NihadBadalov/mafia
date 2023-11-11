import { c as create_ssr_component, a as add_attribute, e as escape } from "../../../../chunks/ssr.js";
import "devalue";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let _minMafiaAmount;
  let _maxMafiaAmount;
  let _mafiaAmount;
  let { form } = $$props;
  let _playerAmount = form?.maxPlayerAmount ?? 6;
  if ($$props.form === void 0 && $$bindings.form && form !== void 0)
    $$bindings.form(form);
  {
    if (_playerAmount < 6 || _playerAmount > 16) {
      _playerAmount = _playerAmount < 6 ? _playerAmount : 16;
    }
  }
  _minMafiaAmount = Math.floor(_playerAmount / 4) - 1 || 1;
  _maxMafiaAmount = Math.ceil(_playerAmount / 3);
  _mafiaAmount = form?.amountOfMafia ?? _minMafiaAmount;
  {
    if (_mafiaAmount < _minMafiaAmount || _mafiaAmount > _maxMafiaAmount) {
      _mafiaAmount = _mafiaAmount < _minMafiaAmount ? _minMafiaAmount : _maxMafiaAmount;
    }
  }
  return `${$$result.head += `<!-- HEAD_svelte-t80emv_START -->${$$result.title = `<title>Create Server - Mafia</title>`, ""}<link rel="stylesheet" href="/src/lib/css/createServer.css"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""><link href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100;200;300;400;500;600;700;800;900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet"><!-- HEAD_svelte-t80emv_END -->`, ""} <div class="wrapper"><div class="header" data-svelte-h="svelte-45l31t"><div><h1 class="serif_font"><a href="/" style="color: #fff; text-decoration: none;">MAFIA — Online Card Game</a></h1></div> <nav><a class="nav_link" href="/">Home</a> <a class="nav_link" href="/discordLink">Discord</a></nav> <div class="header_actions"><button class="btn" id="btn_account">Account</button> <button class="btn" id="btn_log_out">Log Out</button></div></div> <div class="main"><form class="main_inner" method="POST"><div class="create_server"><h1 data-svelte-h="svelte-1va1dv8">Create a Server</h1> <p style="width: 30%; text-align: left; margin-bottom: -1em;" data-svelte-h="svelte-1qulayz">Name of the Server</p> <input${add_attribute("value", form?.serverName ?? "", 0)} name="serverName" type="text" autocomplete="off" placeholder="Name of the Server" minlength="3" maxlength="20" required> <p style="width: 30%; text-align: left; margin-bottom: -1em;" data-svelte-h="svelte-fdmp69">Amount of Players (6-16)</p> <input name="maxPlayerAmount" type="number" autocomplete="off" placeholder="Amount of Players (6-16)" min="6" max="16" required${add_attribute("value", _playerAmount, 0)}> <p id="mafiaAmount_text" style="width: 30%; text-align: left; margin-bottom: -1em;">Amount of Mafia (${escape(_minMafiaAmount)}-${escape(_maxMafiaAmount)})</p> <input id="mafiaAmount_input" name="amountOfMafia" type="number" autocomplete="off" placeholder="${"Amount of Mafia (" + escape(_minMafiaAmount, true) + "-" + escape(_maxMafiaAmount, true) + ")"}"${add_attribute("min", _minMafiaAmount, 0)}${add_attribute("max", _maxMafiaAmount, 0)} required${add_attribute("value", _mafiaAmount, 0)}> <button class="btn" id="btn_create" type="submit" data-svelte-h="svelte-10m61ep">Create</button> ${form?.missing ? `<p style="color: #ff6060; font-weight: 600;" data-svelte-h="svelte-1esiqnm">One of the fields is missing!</p>` : `${form?.incorrect ? `<p style="color: #ff6060; font-weight: 600;" data-svelte-h="svelte-1rjm6e5">One of the fields is incorrect!</p>` : `${form?.serverError ? `<p style="color: #ff6060; font-weight: 600;" data-svelte-h="svelte-si37zv">Server error: couldn&#39;t create a server.</p>` : ``}`}`}</div> <div class="menu_buttons"><button class="btn" id="btn_join_random" data-svelte-h="svelte-17clw3i">Join a random game</button></div></form> <footer data-svelte-h="svelte-mtt87"><a href="/discordLink">Our Discord Server</a> <a href="/terms">Terms of Service</a> <a href="/privacy">Privacy Policy</a></footer></div></div>`;
});
export {
  Page as default
};
