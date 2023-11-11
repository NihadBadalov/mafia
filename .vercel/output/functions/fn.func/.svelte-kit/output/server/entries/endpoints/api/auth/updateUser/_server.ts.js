import { g as getUserByAst } from "../../../../../chunks/index3.js";
import { x as xpActions, r as rawAdminDatabaseActions } from "../../../../../chunks/database.js";
import { a as adminAuth } from "../../../../../chunks/firebase.admin.js";
import { e as error, j as json } from "../../../../../chunks/index.js";
const POST = async ({ request, cookies }) => {
  let { ast, idToken } = await request.json();
  const dataUser = getUserByAst(ast);
  if (!dataUser)
    throw error(404, "User not found");
  idToken ||= cookies.get("fbs");
  if (!idToken)
    throw error(403, "Not Authorized. idToken not provided");
  const firebaseUserId = await adminAuth.verifyIdToken(idToken).then((user) => user.uid).catch(console.error);
  if (!firebaseUserId)
    throw error(404, "User not found. User is not authorized with Firebase");
  const firebaseUser = await adminAuth.getUser(firebaseUserId);
  if (!firebaseUserId)
    throw error(404, "User not found. User is not authorized with Firebase");
  dataUser.name = firebaseUser?.displayName ?? dataUser.name;
  if (!await xpActions.userXpRecordsExists(rawAdminDatabaseActions.db, firebaseUserId)) {
    await xpActions.set(rawAdminDatabaseActions.db, firebaseUserId, 0);
  }
  return json({ success: true }, { status: 200 });
};
export {
  POST
};
