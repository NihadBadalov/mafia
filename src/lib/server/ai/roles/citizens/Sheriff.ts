import { getGameServerById, getUserById, isMafiaGameRole } from "$lib";
import type { GameServer } from "$types";
import { GameRoles } from "$types/GameRoles";
import { GameStates } from "$types/GameStates";
import BaseRole from "../BaseRole";
import { setTimeout as wait } from 'timers/promises';

export class Sheriff extends BaseRole {
  gameRole: Exclude<GameRoles, GameRoles.Unknown> = GameRoles.Sheriff;
  isMafia = false;
  roleGuesses: {
    [key: number]: typeof GameRoles[keyof typeof GameRoles] | undefined;
  } = {}
  playerIdRoleGuessedLastNight: number = -1;

  constructor(
    ast: string,
    userId: number,
    username: string,
    gameId: number,
    urlOrigin: URL['origin'],
  ) {
    super(ast, userId, username, gameId, urlOrigin);
  }

  /*
  * @param server GameServer
  * Custom Sheriff ability user.
  * Cannot use super's vote() (it works for voting + abilities),
  * because we need to keep user info and not throw it away
  */
  async night(
    server: GameServer,
  ): Promise<void> {
    const playerIds = server.players.filter(p => !this.roleGuesses[p] && p !== this.userId);
    const chosenPlayerId = playerIds[Math.floor(Math.random() * playerIds.length)];
    if (playerIds.length === 0 || chosenPlayerId === undefined) return;

    await wait(1000 + Math.floor(Math.random() * 5000));

    this.roleGuesses[chosenPlayerId] = server.playerRoles.find(pr => pr.userId === chosenPlayerId)?.role;
    this.playerIdRoleGuessedLastNight = chosenPlayerId;

    server.specialStates.sheriffAbility = false;
  }

  async day(server: GameServer): Promise<void> {
    await wait(1000 + Math.floor(Math.random() * 3000));

    const player = getUserById(this.playerIdRoleGuessedLastNight);

    if (!player
      || server.players.indexOf(this.playerIdRoleGuessedLastNight) === -1
      || this.playerIdRoleGuessedLastNight === -1) {
      if (Math.floor(Math.random() * 10) > 4)
        await this.sendMessage(this.replies.STARTED.NOT_MUCH[Math.floor(Math.random() * this.replies.STARTED.NOT_MUCH.length)]);;
      return;
    }

    if (isMafiaGameRole(this.roleGuesses[this.playerIdRoleGuessedLastNight])) {
      await this.sendMessage(`I'm the Sheriff. I checked ${player?.name} and his role is ${GameRoles[this.roleGuesses[this.playerIdRoleGuessedLastNight]!]}. Vote for him! (his ID is ${player?.id})`);
      await this.vote(this.playerIdRoleGuessedLastNight);
    }
  }

  async handleChat(
    _server: GameServer,
    msgContent: string,
    authorName: string,
    authorId: number
  ): Promise<void> {
    const messageContent = msgContent
      .toLowerCase()
      .replaceAll('\'', '');

    if (this.userId !== authorId && this.messageContainsKeywords(messageContent, ['i', ['im', 'am'], 'sheriff'])) {
      // Someone is impersonating us
      await this.sendMessage(`@${authorId} ${authorName} is not the Sheriff. I am the Sheriff. He is lying. Let's kick him.`);
    }

    // The bot has been mentioned
    if (this.messageIsMention(messageContent)) {
      const server = getGameServerById(this.serverId);
      if (!server) return;

      // What is the goal/objective?
      if (this.messageContainsKeywords(messageContent, ['what', ['goal', 'objective']])) {
        await this.sendMessage('The goal/objective for Citizens is to find and kick all the Mafias; and for the Mafias it is to kill all the citizens.');
      }

      if (server?.started) {
        /* Server has started yet */
        // What is the current action?
        if (this.messageContainsKeywords(messageContent, ['what', 'current', 'action'])) {
          let currentActionText = 'Current action: ' + (() => {
            if (server.state === GameStates.Day) {
              return server.votingBetween.length > 0 ? 'voting' : 'discussing who to kick';
            }
            else if (server.state === GameStates.Night) {
              return server.specialStates.sheriffAbility ?
                'Sheriff is checking a player\'s role' :
                server.specialStates.doctorAbility ?
                  'Doctor is choosing who to keep alive' :
                  'Mafia is chosing who to kill';
            }
            else if (server.state === GameStates.Ended) {
              return 'game ended, join a new one!';
            }
          })();

          await this.sendMessage(currentActionText);
        }

        // Who are we voting for/between?
        if (this.messageContainsKeywords(messageContent, ['who', 'voting', ['for', 'between']])) {
          await this.sendMessage(`Voting for ${server.votingBetween.map(uid => getUserById(uid)?.name || 'Unnamed user').join(', ') || 'no one'}`);
        }

        // Who is/are mafia(-s)?
        if (this.messageContainsKeywords(messageContent, ['who', ['is', 'are'], 'mafia'])
          || this.messageContainsKeywords(messageContent, ['whos', 'mafia'])
        ) {
          // Who is the voting for?
          await this.sendMessage(this.replies.STARTED.WHO_IS_MAFIA[Math.floor(Math.random() * this.replies.STARTED.WHO_IS_MAFIA.length)]);
        }
      } else {
        /* Server hasn't started yet */
        // When is the server starting?
        if (this.messageContainsKeywords(messageContent, ['when', 'start'])) {
          await this.sendMessage(this.replies.NOT_STARTED.WHEN_STARTING[Math.floor(Math.random() * this.replies.NOT_STARTED.WHEN_STARTING.length)]);
        }
      }
    }
  }
}

