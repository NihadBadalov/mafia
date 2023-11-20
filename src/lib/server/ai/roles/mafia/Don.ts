import { GameRoles } from "$types/GameRoles";
import BaseRole from "../BaseRole";

export class Don extends BaseRole {
  readonly gameRole = GameRoles.Don;
  readonly isMafia = true;

  constructor(
    userId: number,
    username: string,
  ) {
    super(userId, username);
  }
}

