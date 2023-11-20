import { GameRoles } from "$types/GameRoles";
import BaseRole from "../BaseRole";

export class Doctor extends BaseRole {
  readonly gameRole = GameRoles.Doctor;
  readonly isMafia = false;

  constructor(
    userId: number,
    username: string,
  ) {
    super(userId, username);
  }
}

