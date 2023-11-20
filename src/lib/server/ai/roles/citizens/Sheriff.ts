import { GameRoles } from "$types/GameRoles";
import BaseRole from "../BaseRole";

export class Sheriff extends BaseRole {
  readonly gameRole = GameRoles.Sheriff;
  readonly isMafia = false;

  constructor(
    userId: number,
    username: string,
  ) {
    super(userId, username);
  }
}

