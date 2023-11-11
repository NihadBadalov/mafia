import { _ as _data } from "./index4.js";
import { i as io } from "./webSocketConnection.js";
var GameRoles = /* @__PURE__ */ ((GameRoles2) => {
  GameRoles2[GameRoles2["Unknown"] = 0] = "Unknown";
  GameRoles2[GameRoles2["Mafia"] = 1] = "Mafia";
  GameRoles2[GameRoles2["Don"] = 2] = "Don";
  GameRoles2[GameRoles2["Citizen"] = 3] = "Citizen";
  GameRoles2[GameRoles2["Doctor"] = 4] = "Doctor";
  GameRoles2[GameRoles2["Sheriff"] = 5] = "Sheriff";
  return GameRoles2;
})(GameRoles || {});
function updateServer(serverId) {
  io.emit("serverEvent", {
    message: "updateServer",
    serverId
  });
}
const isMafiaGameRole = (a) => {
  return a === GameRoles.Mafia || a === GameRoles.Don;
};
function gameAnnounce(content, includedRoles, serverId, data = _data) {
  return new Promise((res, rej) => {
    if (Number.isNaN(serverId))
      return rej("Invalid server ID provided");
    const includedAnnouncementRoleIds = getIncludedRolesForGameAnnouncement(includedRoles);
    const server = data.servers.find((s) => s?.id === serverId);
    if (!server)
      return rej("Couldn't find the server");
    for (let i = 0; i < includedAnnouncementRoleIds.length; i++) {
      server.announcements[includedAnnouncementRoleIds[i]] = content;
    }
    updateServer(serverId);
    res(true);
  });
}
function getIncludedRolesForGameAnnouncement(inc) {
  let include = [];
  if (Array.isArray(inc)) {
    include = inc;
  } else if (inc === "all") {
    include = [
      GameRoles.Unknown,
      GameRoles.Mafia,
      GameRoles.Don,
      GameRoles.Citizen,
      GameRoles.Doctor,
      GameRoles.Sheriff
    ];
  } else if (inc === "mafia") {
    include = [
      GameRoles.Mafia,
      GameRoles.Don
    ];
  } else if (inc === "citizens") {
    include = [
      GameRoles.Unknown,
      GameRoles.Citizen,
      GameRoles.Doctor,
      GameRoles.Sheriff
    ];
  } else if (!Number.isNaN(inc)) {
    include = [inc];
  } else {
    include = [
      GameRoles.Unknown,
      GameRoles.Mafia,
      GameRoles.Don,
      GameRoles.Citizen,
      GameRoles.Doctor,
      GameRoles.Sheriff
    ];
  }
  return include;
}
function randomEnumValue(enumeration) {
  const numberEnumValues = Object.keys(enumeration).filter((k) => !Number.isNaN(+k));
  return numberEnumValues[Math.floor(Math.random() * numberEnumValues.length)];
}
function arrayShuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex]
    ];
  }
  return array;
}
function getFullEndpointUrl(endpointPath, currentLocationHref) {
  const url = new URL(currentLocationHref);
  const subdomain = url.hostname.split(".")[0];
  const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1" || true;
  let fullApiUrl = "";
  if (isLocalhost) {
    fullApiUrl = `${url.protocol}//${url.hostname}:${url.port}`;
  } else {
    const domain = url.hostname.split(".").slice(1).join(".");
    const protocol = url.protocol === "https:" ? "https:" : "http:";
    const www = subdomain === "www" ? "www." : "";
    fullApiUrl = `${protocol}//${www}${domain}`;
  }
  fullApiUrl += endpointPath;
  return fullApiUrl;
}
function getUserRoleInServer(id, data) {
  let server = getGameServerWithUserById(id, data);
  if (!server)
    return;
  if (!server.started)
    return;
  let role = server.playerRoles.find((pr) => pr.userId === id);
  return role?.role;
}
function getGameServerWithUserById(id, data = _data) {
  let user = getUserById(id, data);
  if (!user)
    return;
  let server = data.servers.find((s) => s.players.includes(user.id));
  if (!server)
    return;
  return server;
}
function getUserByAst(ast, data = _data) {
  if (typeof ast == "undefined")
    return void 0;
  if (!ast)
    return void 0;
  const userId = data?.userAsts?.find((u) => u.token === ast)?.id;
  if (!userId)
    return;
  const user = data.users.find((u) => u.id === userId);
  return user;
}
function getUserById(id, data = _data) {
  if (Number.isNaN(id))
    return;
  let user = data.users.find((u) => u?.id === id);
  return user;
}
export {
  GameRoles as G,
  getGameServerWithUserById as a,
  getUserRoleInServer as b,
  getUserById as c,
  gameAnnounce as d,
  arrayShuffle as e,
  getFullEndpointUrl as f,
  getUserByAst as g,
  isMafiaGameRole as i,
  randomEnumValue as r
};
