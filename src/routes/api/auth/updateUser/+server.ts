import { getUserByAst } from "$lib";
import { rawAdminDatabaseActions, xpActions } from "$lib/firebase/database";
import { adminAuth } from "$lib/firebase/firebase.admin";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, cookies }) => {
  // eslint-disable-next-line prefer-const
  let { ast, idToken } = await request.json();

  const dataUser = getUserByAst(ast);
  if (!dataUser) throw error(404, 'User not found');

  idToken ||= cookies.get('fbs');
  if (!idToken)
    throw error(403, 'Not Authorized. idToken not provided');

  const firebaseUserId = await adminAuth.verifyIdToken(idToken)
    .then((user) => user.uid)
    .catch(console.error);
  if (!firebaseUserId)
    throw error(404, 'User not found. User is not authorized with Firebase');

  const firebaseUser = await adminAuth.getUser(firebaseUserId);
  if (!firebaseUserId)
    throw error(404, 'User not found. User is not authorized with Firebase');

  dataUser.name = firebaseUser?.displayName ?? dataUser.name;

  // Create an XP database row for the user
  if (!await xpActions.userXpRecordsExists(rawAdminDatabaseActions.db, firebaseUserId)) {
    await xpActions.set(rawAdminDatabaseActions.db, firebaseUserId, 0);
  }

  return json({ success: true }, { status: 200 });
}

