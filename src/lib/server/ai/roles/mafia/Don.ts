import { GameRoles } from "$types/GameRoles";
import BaseRole from "../BaseRole";

class Don extends BaseRole {
  readonly gameRole = GameRoles.Don;
  readonly isMafia = true;

  constructor(userId: number) {
    super(userId);
  }
}

