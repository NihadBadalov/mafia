import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
  throw redirect(307, 'https://discord.gg/VWw5QA8tJ5');
}

