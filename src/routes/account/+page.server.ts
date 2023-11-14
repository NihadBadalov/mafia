import { getUserByAst } from "$lib";
import { rawAdminDatabaseActions, usernameActions } from "$lib/firebase/database";
import { adminAuth } from "$lib/firebase/firebase.admin";
import type { PageServerLoad } from "../$types";

export const load: PageServerLoad = (async ({ cookies }) => {
  const user = getUserByAst(cookies.get('ast'))

  let firebaseUserId;
  if (cookies.get('fbs')?.length)
    firebaseUserId = await adminAuth
      .verifyIdToken(cookies.get('fbs')!)
      .then((user) => user.uid)
      .catch(() => false);

  return {
    currentUser: user,
    currentUsername: await usernameActions?.get(rawAdminDatabaseActions.db, firebaseUserId as string),
  };
});
