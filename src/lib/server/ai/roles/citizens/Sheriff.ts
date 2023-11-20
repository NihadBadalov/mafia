import { GameRoles } from "$types/GameRoles";
import BaseRole from "../BaseRole";

class Sheriff extends BaseRole {
  readonly gameRole = GameRoles.Sheriff;
  readonly isMafia = false;

  constructor(userId: number) {
    super(userId);
  }
}

