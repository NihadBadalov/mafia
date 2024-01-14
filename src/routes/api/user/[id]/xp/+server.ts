import { getUserByAst, getUserById } from "$lib";
import { rawAdminDatabaseActions } from "$lib/firebase/database";
import { _data } from "$routes/api";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params, cookies }) => {
  const user = getUserByAst(cookies.get('ast'));
  if (!user)
    throw error(403, 'Not Authorized. User not logged in');

  const { id: userId } = params;
  const targetUser = getUserById(Number(userId), _data);
  if (!targetUser || !userId)
    throw error(404, 'User not found');

  // await rawAdminDatabaseActions.set(`ast/${cookies.get('ast')}`, );
  const userXp = await rawAdminDatabaseActions.get(`xp/${targetUser?.id}`);

  return json({ success: true, xp: userXp ?? 0 }, { status: 200 });
}
