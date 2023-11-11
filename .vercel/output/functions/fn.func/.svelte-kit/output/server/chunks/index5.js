import { d as dev } from "./webSocketConnection.js";
import { g as getUserByAst, f as getFullEndpointUrl } from "./index3.js";
import { a as adminAuth } from "./firebase.admin.js";
import { a as _generateUserToken, _ as _data } from "./index4.js";
const guestUserUsernameRegExp = new RegExp(/User \d+/);
async function handleUserSession(cookies, fetch, endpoint) {
  if (!cookies.get("ast") || !cookies.get("ast")?.length || !getUserByAst(cookies.get("ast"))) {
    const fbs = cookies.get("fbs");
    const firebaseUserId = fbs ? await adminAuth.verifyIdToken(fbs).then((user) => user.uid).catch(() => null) : null;
    const firebaseUser = firebaseUserId ? await adminAuth.getUser(firebaseUserId) : null;
    const username = firebaseUser?.displayName ?? `User ${Math.round(Math.random() * 999999)}`;
    const userToken = _generateUserToken(30);
    const response = await fetch(getFullEndpointUrl("/api/user", endpoint), {
      method: "POST",
      body: JSON.stringify({
        event: "createUser",
        username
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });
    const userCreationData = await response.json();
    _data?.userAsts?.push({
      id: userCreationData?.id,
      token: userToken
    });
    try {
      cookies.set("ast", userToken, {
        path: "/",
        secure: !dev
      });
    } catch {
    }
  } else if (cookies.get("ast") && cookies.get("fbs")) {
    const user = getUserByAst(cookies.get("ast"));
    if (!user)
      return;
    if (!guestUserUsernameRegExp.test(user.name))
      return user?.id;
    const firebaseUserId = await adminAuth.verifyIdToken(cookies.get("fbs")).then((user2) => user2.uid).catch(() => null);
    const firebaseUser = firebaseUserId ? await adminAuth.getUser(firebaseUserId) : null;
    if (!firebaseUser)
      return user?.id;
    const dataUser = _data.users.find((u) => u.id === user?.id);
    if (!dataUser)
      return user?.id;
    dataUser.name = firebaseUser.displayName ?? user?.name;
  }
  return getUserByAst(cookies.get("ast"))?.id;
}
export {
  handleUserSession as h
};
