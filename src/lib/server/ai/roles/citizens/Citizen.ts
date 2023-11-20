import { GameRoles } from "$types/GameRoles";
import BaseRole from "../BaseRole";

class Citizen extends BaseRole {
  readonly gameRole = GameRoles.Citizen;
  readonly isMafia = false;

  constructor(userId: number) {
    super(userId);
  }
}

