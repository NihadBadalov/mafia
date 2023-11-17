import { getUserByAst, hasCurseWords } from '$lib';
import { _data } from '$routes/api';
import { authHandlers } from '$stores/auth';
import { fail, type Actions } from '@sveltejs/kit';
import type { UserCredential } from 'firebase/auth';
import type { PageServerLoad } from '../../$types';
import { rawAdminDatabaseActions, xpActions, usernameActions } from '$lib/firebase/database';
import { z } from 'zod';
const emailSchema = z.string().email();

export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const username: string = data.get('username') as string || '';
    const email: string = data.get('email') as string || '';
    const password: string = data.get('password') as string || '';
    const confirmPassword: string = data.get('confirmPassword') as string;
    const registering = confirmPassword !== null;

    if (!email) return fail(400, { email, missing: true });
    if (email.length < 6) return fail(400, { email, incorrect: true });
    if (!emailSchema.safeParse(email)?.success) return fail(400, { email, incorrect: true, zod: true });

    if (!password) return fail(400, { password, missing: true });
    if (password.length < 8) return fail(400, { password, incorrect: true });

    if (registering) {
      if (!confirmPassword) return fail(400, { confirmPassword, missing: true });
      if (password !== confirmPassword) return fail(400, { confirmPassword, incorrect: true });
      if (username?.length < 5) return fail(400, { username, incorrect: true });
      if (hasCurseWords(username)) return fail(400, { username, incorrect: true, curseWords: true });
    }


    try {
      let userCredentials: UserCredential;
      if (registering) {
        userCredentials = await authHandlers.signup(email, password);
      }
      else {
        userCredentials = await authHandlers.login(email, password);
      }

      // Change username based on account's display name
      if (cookies.get('ast')
        && userCredentials?.user?.displayName) {
        const dataUser = getUserByAst(cookies.get('ast'));
        if (dataUser) dataUser.name = userCredentials.user.displayName ?? dataUser?.name;
      }

      // Store custom username
      if (registering && username && userCredentials?.user?.uid) {
        await usernameActions.set(rawAdminDatabaseActions.db, userCredentials?.user?.uid, username?.trim());
      }

      // Create an XP database row for the user
      if (userCredentials?.user?.uid) {
        if (!await xpActions.userXpRecordsExists(rawAdminDatabaseActions.db, userCredentials.user?.uid)) {
          await xpActions.set(rawAdminDatabaseActions.db, userCredentials.user?.uid, 0);
        }
      }
    }
    catch (e: any) {
      console.error(e);
      // Not necessarily a server error, but oh well!
      return fail(500, { serverError: true, errorCode: e?.code });
    }
    return { success: true, registering, email, password, username };
  },
} satisfies Actions;

export const load: PageServerLoad = (async ({ cookies }) => {
  return {
    ast: cookies.get('ast'),
  };
});

