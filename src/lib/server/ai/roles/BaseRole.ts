import { _data } from "$routes/api";
import type { UserId } from "$types";
import type { GameRoles } from "$types/GameRoles";

export default abstract class BaseRole {
  abstract gameRole: typeof GameRoles[keyof typeof GameRoles];
  abstract isMafia: boolean;

  userId: number;
  username: string;

  suspicionLevel: number = 0;
  isAlive: boolean = true;

  constructor(
    userId: UserId,
    username: string,
  ) {
    this.userId = userId;
    this.username = username;
  }

  selfDestruct(): boolean {
    if (_data.users.find(u => u.id === this.userId)) return false;
    _data.users.splice(_data.users.findIndex(u => u.id === this.userId), 1);
    return true;
  }
}

export type BaseRoleType = typeof BaseRole;
export type BaseRoleDerivative<T> = T extends BaseRole ? T : never;

