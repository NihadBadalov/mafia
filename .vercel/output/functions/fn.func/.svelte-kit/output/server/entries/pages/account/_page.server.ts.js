import { g as getUserByAst } from "../../../chunks/index3.js";
const load = async ({ cookies }) => {
  const user = getUserByAst(cookies.get("ast"));
  return {
    currentUser: user
  };
};
export {
  load
};
