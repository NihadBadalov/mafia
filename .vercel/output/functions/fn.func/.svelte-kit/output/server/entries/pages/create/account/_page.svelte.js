import { s as subscribe } from "../../../../chunks/utils.js";
import { c as create_ssr_component, e as escape, a as add_attribute } from "../../../../chunks/ssr.js";
import "devalue";
import "../../../../chunks/firebase.client.js";
import { a as authStore } from "../../../../chunks/auth.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let headingText;
  let buttonText;
  let $$unsubscribe_authStore;
  $$unsubscribe_authStore = subscribe(authStore, (value) => value);
  let { form } = $$props;
  let { data } = $$props;
  let email = "";
  let password = "";
  let confirmPassword = "";
  let formError = "";
  if ($$props.form === void 0 && $$bindings.form && form !== void 0)
    $$bindings.form(form);
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  headingText = "Create an Account";
  buttonText = "SIGN UP";
  {
    if (form?.missing) {
      formError = "One of the fields is missing!";
    } else if (form?.incorrect) {
      if (form?.username) {
        formError = "Username is too short! (min. 5 characters)";
      } else if (form?.email) {
        formError = "Email is incorrect!";
      } else if (form?.password) {
        formError = "Password is too short! (min. 8 characters)";
      } else if (form?.confirmPassword) {
        formError = "Confirmation password is incorrect!";
      } else {
        formError = "One of the fields is incorrect!";
      }
    } else if (form?.serverError) {
      if (form?.errorCode === "auth/invalid-login-credentials") {
        formError = "Wrong password";
      } else if (form?.errorCode === "auth/too-many-requests") {
        formError = "Rate limit exceeded: too many attempts";
      } else if (form?.errorCode === "auth/email-already-in-use") {
        formError = "Email is already in use";
      } else {
        formError = "Server error: couldn't create the account.<br />Please submit a bug request to the developers! :)";
      }
    }
  }
  $$unsubscribe_authStore();
  return `<div class="wrapper"><div class="header"><div data-svelte-h="svelte-k8azry"><h1 class="serif_font"><a href="/" style="color: #fff; text-decoration: none;">MAFIA — Online Card Game</a></h1></div> <nav data-svelte-h="svelte-10xf5ml"><a class="nav_link" href="/">Home</a> <a class="nav_link" href="/discordLink">Discord</a></nav> <div class="header_actions"><button class="btn" id="btn_account" data-svelte-h="svelte-ue98m6">Account</button></div></div> <div class="main"><div class="main_inner"><form class="create_account" method="POST"><h1>Welcome${escape("")}!<br><span>${escape(headingText)}</span></h1> ${`<p style="width: 30%; text-align: left; margin-bottom: -1em;" data-svelte-h="svelte-328xpt">Username</p> <input type="text" autocomplete="off" placeholder="Enter your username" name="username" minlength="5" required${add_attribute("value", email, 0)}>`} <p style="width: 30%; text-align: left; margin-bottom: -1em;" data-svelte-h="svelte-mwmwgl">Email</p> <input type="email" autocomplete="off" placeholder="Enter your email" name="email" required${add_attribute("value", email, 0)}> <p style="width: 30%; text-align: left; margin-bottom: -1em;" data-svelte-h="svelte-10l1x8q">Password</p> <input type="password" autocomplete="off" placeholder="Enter you password" name="password" minlength="6" required${add_attribute("value", password, 0)}> ${`<p style="width: 30%; text-align: left; margin-bottom: -1em;" data-svelte-h="svelte-ov547y">Confirm Password</p> <input type="password" autocomplete="off" placeholder="Confirm your password" name="confirmPassword" minlength="8" required${add_attribute("value", confirmPassword, 0)}>`} <button class="btn" type="submit">${escape(buttonText)}</button> <p data-svelte-h="svelte-8lmj7z">OR</p> <button class="btn" id="btn_google" data-svelte-h="svelte-1tx0n0c"><svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 488 512"><style>svg {
                fill: #ffffff;
              }
            </style><path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg> <span>CONTINUE WITH <bold>GOOGLE</bold></span></button> ${`<p id="action_call" data-svelte-h="svelte-19zhd89"><i>Don&#39;t miss out on: <span>Friends, XP, Skilled Matchmaking</span>.<i></i></i></p>   <p><i${add_attribute(
    "class",
    form?.errorCode === "auth/email-already-in-use" ? "bold underline important" : "",
    0
  )}>Already have an account? <span class="fake_link" data-svelte-h="svelte-1davfsy">Log In</span></i></p>`} <p style="color: #ff6060; font-weight: 600;"><!-- HTML_TAG_START -->${formError}<!-- HTML_TAG_END --></p></form></div> <footer data-svelte-h="svelte-mtt87"><a href="/discordLink">Our Discord Server</a> <a href="/terms">Terms of Service</a> <a href="/privacy">Privacy Policy</a></footer></div></div> ${$$result.head += `<!-- HEAD_svelte-1ukgwt9_START -->${$$result.title = `<title>Create Account - Mafia</title>`, ""}<link rel="stylesheet" href="/src/lib/css/createAccount.css"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""><link href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100;200;300;400;500;600;700;800;900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet"><!-- HEAD_svelte-1ukgwt9_END -->`, ""}`;
});
export {
  Page as default
};
