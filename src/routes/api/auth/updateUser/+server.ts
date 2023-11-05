import { getUserByAst } from "$lib";
import { adminAuth } from "$lib/firebase/firebase.admin";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, cookies }) => {
  let { ast, idToken } = await request.json();

  const dataUser = getUserByAst(ast);
  if (!dataUser) throw error(404, 'User not found');

  idToken ||= cookies.get('fbs');
  if (!idToken)
    throw error(403, 'Not Authorized. idToken not provided');

  const firebaseUserID = await adminAuth.verifyIdToken(idToken)
    .then((user) => user.uid)
    .catch(console.error);
  if (!firebaseUserID)
    throw error(404, 'User not found. User is not authorized with Firebase');

  const firebaseUser = await adminAuth.getUser(firebaseUserID);
  if (!firebaseUserID)
    throw error(404, 'User not found. User is not authorized with Firebase');

  dataUser.name = firebaseUser?.displayName ?? dataUser.name;

  return json({ success: true }, { status: 200 });
}

