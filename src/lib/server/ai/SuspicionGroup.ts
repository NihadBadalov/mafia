import { getGameServerWithUserById } from "$lib";
import { _data } from "$routes/api";
import type { UserId } from "$types";
import { GameRoles } from "$types/GameRoles";

export default class SuspicionGroup {
  suspecting: UserId;
  possibleRole: GameRoles;
  roleProposals: Map<GameRoles, number> = new Map();
  botsAttached: UserId[] = [];

  constructor(
    userId: UserId | number,
    possibleRole: GameRoles = GameRoles.Unknown,
  ) {
    this.suspecting = userId;
    this.possibleRole = possibleRole;
  }

  attach(userId: UserId) {
    this.botsAttached.unshift(userId);

    const server = getGameServerWithUserById(userId);
    server?.bots?.find(b => b.userId === userId)?.suspect(userId);
  }

  suspectNewRole(role: GameRoles) {
    if (this.roleProposals.has(role)) this.roleProposals.set(role, this.roleProposals.get(role)!)
    else this.roleProposals.set(role, 1);
  }
}
