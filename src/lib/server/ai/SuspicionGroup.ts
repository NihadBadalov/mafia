import { getGameServerWithUserById, getUserRoleInServer, isMafiaGameRole } from "$lib";
import type { UserId } from "$types";
import { GameRoles } from "$types/GameRoles";
import type BaseRole from "./roles/BaseRole";

export default class SuspicionGroup {
  suspecting: UserId;
  possibleRole: GameRoles;
  roleProposals = new Map<GameRoles, number>();
  botsAttached: UserId[] = [];
  created: number;

  constructor(
    userId: UserId,
    possibleRole: GameRoles = GameRoles.Unknown,
  ) {
    this.suspecting = userId;
    this.possibleRole = possibleRole;
    this.created = Date.now();
  }

  attach(userId: UserId) {
    this.botsAttached.unshift(userId);

    const server = getGameServerWithUserById(userId);
    if (!server) return;

    const suspectedPlayerRole = getUserRoleInServer(userId);
    let randomBot: BaseRole;
    
    if (isMafiaGameRole(suspectedPlayerRole)) {
      const nonMafiaBots = server.bots
        .filter(bot => bot.userId !== userId && !isMafiaGameRole(getUserRoleInServer(userId)));
      randomBot = nonMafiaBots[Math.floor(Math.random() * nonMafiaBots.length - 1)];
    } else {
      randomBot = server.bots
        .filter(bot => bot.userId !== userId)[Math.floor(Math.random() * server.bots.length - 1)];
    }

    randomBot?.suspect(userId);
  }

  suspectNewRole(role: GameRoles) {
    if (this.roleProposals.has(role)) this.roleProposals.set(role, this.roleProposals.get(role)!)
    else this.roleProposals.set(role, 1);
  }
}
