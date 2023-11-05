import { dev } from "$app/environment";
import { getFullEndpointUrl, getUserByAst } from "$lib";
import { adminAuth } from "$lib/firebase/firebase.admin";
import { _data, _generateUserToken } from "$routes/api";
import type { Cookies } from "@sveltejs/kit";

export const guestUserUsernameRegExp = new RegExp(/User \d+/);

/*
    * Handle user session, if user doesn't have one
*/
export async function handleUserSession(cookies: Cookies, fetch: any, endpoint: string) {
  // User session
  if (!cookies.get('ast')
    || !cookies.get('ast')?.length
    || !getUserByAst(cookies.get('ast')! as string)) {
    // Not in session 
    const fbs = cookies.get('fbs');
    const firebaseUserId = fbs ? await adminAuth.verifyIdToken(fbs as string)
      .then((user) => user.uid)
      .catch(() => null) : null;
    const firebaseUser = firebaseUserId ? await adminAuth.getUser(firebaseUserId) : null;
    const username = firebaseUser?.displayName ?? `User ${Math.round(Math.random() * 999999)}`;
    const userToken = _generateUserToken(30);

    const response = await fetch(getFullEndpointUrl('/api/users', endpoint), {
      method: 'POST',
      body: JSON.stringify({
        event: 'createUser',
        username: username,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const userCreationData = await response.json();

    _data?.userAsts?.push({
      id: userCreationData?.id,
      token: userToken,
    });
    try {
      cookies.set('ast', userToken, {
        path: '/',
        secure: !dev,
      });
    } catch { }
  }

  // If user is auth'ed, change their username and return userId
  else if (cookies.get('ast') && cookies.get('fbs')) {
    const user = getUserByAst(cookies.get('ast'));
    if (!user) return;
    if (!guestUserUsernameRegExp.test(user.name)) return user?.id;

    const firebaseUserId = await adminAuth.verifyIdToken(cookies.get('fbs') as string)
      .then((user) => user.uid)
      .catch(() => null);
    const firebaseUser = firebaseUserId ? await adminAuth.getUser(firebaseUserId) : null;
    if (!firebaseUser) return user?.id;

    const dataUser = _data.users.find(u => u.id === user?.id);
    if (!dataUser) return user?.id;

    dataUser.name = firebaseUser.displayName ?? user?.name;
  }

  return getUserByAst(cookies.get('ast'))?.id;
}
