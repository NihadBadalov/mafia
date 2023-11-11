import { g as getUserByAst } from "../../../../chunks/index3.js";
import "../../../../chunks/index4.js";
import { b as authHandlers } from "../../../../chunks/auth.js";
import { f as fail } from "../../../../chunks/index.js";
import { u as usernameActions, r as rawAdminDatabaseActions, x as xpActions } from "../../../../chunks/database.js";
const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const username = data.get("username") || "";
    const email = data.get("email") || "";
    const password = data.get("password") || "";
    const confirmPassword = data.get("confirmPassword");
    const registering = confirmPassword !== null;
    if (!email)
      return fail(400, { email, missing: true });
    if (email.length < 6)
      return fail(400, { email, incorrect: true });
    if (!password)
      return fail(400, { password, missing: true });
    if (password.length < 8)
      return fail(400, { password, incorrect: true });
    if (registering) {
      if (!confirmPassword)
        return fail(400, { confirmPassword, missing: true });
      if (password !== confirmPassword)
        return fail(400, { confirmPassword, incorrect: true });
      if (username?.length < 5)
        return fail(400, { username, incorrect: true });
    }
    try {
      let userCredentials;
      if (registering) {
        userCredentials = await authHandlers.signup(email, password);
      } else {
        userCredentials = await authHandlers.login(email, password);
      }
      if (cookies.get("ast") && userCredentials?.user?.displayName) {
        const dataUser = getUserByAst(cookies.get("ast"));
        if (dataUser)
          dataUser.name = userCredentials.user.displayName ?? dataUser?.name;
      }
      if (registering && username && userCredentials?.user?.uid) {
        await usernameActions.set(rawAdminDatabaseActions.db, userCredentials?.user?.uid, username?.trim());
      }
      if (userCredentials?.user?.uid) {
        if (!await xpActions.userXpRecordsExists(rawAdminDatabaseActions.db, userCredentials.user?.uid)) {
          await xpActions.set(rawAdminDatabaseActions.db, userCredentials.user?.uid, 0);
        }
      }
    } catch (e) {
      console.error(e);
      return fail(500, { serverError: true, errorCode: e?.code });
    }
    return { success: true, registering, email, password, username };
  }
};
const load = async ({ cookies }) => {
  return {
    ast: cookies.get("ast")
  };
};
export {
  actions,
  load
};
