import { dev } from "$app/environment";
import { getFullEndpointUrl, getUserByAst } from "$lib";
import { adminAuth } from "$lib/firebase/firebase.admin";
import { _data, _generateUserToken } from "$routes/api";
import type { Cookies } from "@sveltejs/kit";

/*
    * Handle user session, if user doesn't have one
*/
export async function handleUserSession(cookies: Cookies, fetch: any, endpoint: string) {
  // User session
  if (!cookies.get('ast')
    || !cookies.get('ast')?.length
    || !getUserByAst(cookies.get('ast')! as string)) {
    // Not in session 
    const username = `User ${Math.round(Math.random() * 999999)}`;
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
    } catch {
    }
  }
  return getUserByAst(cookies.get('ast'))?.id;
}
