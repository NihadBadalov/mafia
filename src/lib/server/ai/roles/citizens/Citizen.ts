import { GameRoles } from "$types/GameRoles";
import BaseRole from "../BaseRole";

export class Citizen extends BaseRole {
  readonly gameRole = GameRoles.Citizen;
  readonly isMafia = false;

  constructor(
    userId: number,
    username: string,
  ) {
    super(userId, username);
  }
}

