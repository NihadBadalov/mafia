import { getGameServerWithUserById } from "$lib";
import type { UserId } from "$types";
import { GameRoles } from "$types/GameRoles";

export default class SuspicionGroup {
  suspecting: UserId;
  possibleRole: GameRoles;
  roleProposals = new Map<GameRoles, number>();
  botsAttached: UserId[] = [];

  constructor(
    userId: UserId,
    possibleRole: GameRoles = GameRoles.Unknown,
  ) {
    this.suspecting = userId;
    this.possibleRole = possibleRole;
  }

  /*
    * TODO:
    * - Player on-kick: destruct
  */
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
