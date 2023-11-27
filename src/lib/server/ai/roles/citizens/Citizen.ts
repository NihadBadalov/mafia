import type { GameServer } from "$types";
import { GameRoles } from "$types/GameRoles";
import BaseRole from "../BaseRole";

export class Citizen extends BaseRole {
  readonly gameRole = GameRoles.Citizen;
  readonly isMafia = false;

  handleChat(server: GameServer, messageContent: string, authorName: string, authorId: number): void {
    if (this.messageIsMention(messageContent)) {
      console.log(`${authorName} MENTIONED ME! ${this.username} is so happy!`);
    }
  }

  constructor(
    userId: number,
    username: string,
  ) {
    super(userId, username);
  }
}

