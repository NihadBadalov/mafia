import { GameRoles } from "$types/GameRoles";
import BaseRole from "../BaseRole";

export class Mafia extends BaseRole {
  readonly gameRole = GameRoles.Mafia;
  readonly isMafia = true;

  constructor(
    userId: number,
    username: string,
  ) {
    super(userId, username);
  }
}

