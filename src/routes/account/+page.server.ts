import { getUserByAst } from "$lib";
import type { PageServerLoad } from "../$types";

export const load: PageServerLoad = (async ({ cookies }) => {
  const user = getUserByAst(cookies.get('ast'))
  return {
    currentUser: user,
  };
});
