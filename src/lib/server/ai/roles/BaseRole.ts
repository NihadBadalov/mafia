import { BotMentionRegex } from "$lib";
import { _data } from "$routes/api";
import type { GameServer, UserId } from "$types";
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

  abstract handleChat(
    server: GameServer,
    messageContent: string,
    authorName: string,
    authorId: number,
  ): void;

  messageIsMention(messageContent: string): boolean {
    return !!messageContent
      .match(BotMentionRegex)
      ?.[0]
      ?.replaceAll('@', '')
      ?.replaceAll(',', ' ')
      ?.split(/ +/)
      ?.includes('' + this.userId);
  }

  selfDestruct(): boolean {
    if (_data.users.find(u => u.id === this.userId)) return false;
    _data.users.splice(_data.users.findIndex(u => u.id === this.userId), 1);
    return true;
  }
}

export type BaseRoleType = typeof BaseRole;
export type BaseRoleDerivative<T> = T extends BaseRole ? T : never;

