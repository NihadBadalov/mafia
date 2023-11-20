import type { UserId } from "$types";
import type { GameRoles } from "$types/GameRoles";

export default abstract class Mafia {
  abstract gameRole: typeof GameRoles[keyof typeof GameRoles];
  abstract isMafia: boolean;
  userId: number;
  suspicionLevel: number = 0;
  isAlive: boolean = true;

  constructor(userId: UserId) {
    this.userId = userId;
  }
}

