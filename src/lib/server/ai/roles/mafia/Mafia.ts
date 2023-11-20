import { GameRoles } from "$types/GameRoles";
import BaseRole from "../BaseRole";

class Mafia extends BaseRole {
  readonly gameRole = GameRoles.Mafia;
  readonly isMafia = true;

  constructor(userId: number) {
    super(userId);
  }
}

