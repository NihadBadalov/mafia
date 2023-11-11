import { g as getUserByAst, c as getUserById } from "../../../../../../chunks/index3.js";
import { r as rawAdminDatabaseActions } from "../../../../../../chunks/database.js";
import { _ as _data } from "../../../../../../chunks/index4.js";
import { e as error, j as json } from "../../../../../../chunks/index.js";
const GET = async ({ params, cookies }) => {
  let user = getUserByAst(cookies.get("ast"));
  if (!user)
    throw error(403, "Not Authorized. User not logged in");
  let { id: userId } = params;
  let targetUser = getUserById(Number(userId), _data);
  if (!targetUser || !userId)
    throw error(404, "User not found");
  const userXp = await rawAdminDatabaseActions.get(`xp/${targetUser?.id}`);
  return json({ success: true, xp: userXp ?? 0 }, { status: 200 });
};
export {
  GET
};
