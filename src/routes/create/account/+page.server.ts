import { authHandlers } from '$stores/authStore';
import { fail, type Actions } from '@sveltejs/kit';

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const email: string = data.get('email') as string || '';
    const password: string = data.get('password') as string || '';
    const confirmPassword: string = data.get('confirmPassword') as string;
    const registering = confirmPassword !== null;


    if (!email) return fail(400, { email, missing: true });
    if (email.length < 6) return fail(400, { email, incorrect: true });

    if (!password) return fail(400, { password, missing: true });
    if (password.length < 8) return fail(400, { password, incorrect: true });

    if (registering) {
      if (!confirmPassword) return fail(400, { confirmPassword, missing: true });
      if (password !== confirmPassword) return fail(400, { confirmPassword, incorrect: true });
    }


    try {
      if (registering) {
        await authHandlers.signup(email, password);
      }
      else {
        await authHandlers.login(email, password);
      }
    }
    catch(e: any) {
      console.error(e);
      // Not necessarily a server error, but oh well!
      return fail(500, { serverError: true, errorCode: e?.code });
    }
    return { success: true, registering, email, password };
  },
} satisfies Actions;
