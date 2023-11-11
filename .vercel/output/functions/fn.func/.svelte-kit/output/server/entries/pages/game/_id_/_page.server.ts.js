import { e as error, r as redirect } from "../../../../chunks/index.js";
import { h as handleUserSession } from "../../../../chunks/index5.js";
const load = async ({ fetch, params, cookies }) => {
  const response = await fetch("/api/servers");
  const data = await response.json();
  if (!data || !data?.servers)
    throw error(500, "Server error: Couldn't fetch servers");
  const currentUserId = await handleUserSession(cookies, fetch, data.endpoint);
  const servers = data.servers;
  if (!params?.id || isNaN(params?.id))
    throw redirect(307, "/");
  if (!servers.find((s) => s.id === +params.id))
    throw redirect(307, "/");
  const currentServer = servers.find((s) => s.id === +params.id);
  return {
    ...data,
    currentServerId: currentServer.id,
    currentUserId,
    ast: cookies.get("ast")
  };
};
export {
  load
};
