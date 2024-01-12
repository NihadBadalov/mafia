import { GameRoles } from "$types/GameRoles";
import { Mafia } from "./Mafia";

export class Don extends Mafia {
  gameRole: Exclude<GameRoles, GameRoles.Unknown> = GameRoles.Don;
  isMafia = true;

  // TODO: override
  // override async night(server: GameServer): Promise<void> {
  // }
  constructor(
    ast: string,
    userId: number,
    username: string,
    gameId: number,
    urlOrigin: URL['origin'],
  ) {
    super(ast, userId, username, gameId, urlOrigin);
  }
}

