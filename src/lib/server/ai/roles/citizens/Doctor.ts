import { GameRoles } from "$types/GameRoles";
import BaseRole from "../BaseRole";

class Doctor extends BaseRole {
  readonly gameRole = GameRoles.Doctor;
  readonly isMafia = false;

  constructor(userId: number) {
    super(userId);
  }
}

