import { getGameServerById, getUserById, isMafiaGameRole } from "$lib";
import type { GameServer } from "$types";
import { GameRoles } from "$types/GameRoles";
import { GameStates } from "$types/GameStates";
import BaseRole from "../BaseRole";
import { setTimeout as wait } from 'timers/promises';

export class Sheriff extends BaseRole {
  readonly gameRole = GameRoles.Sheriff;
  readonly isMafia = false;
  roleGuesses: {
    [key: number]: typeof GameRoles[keyof typeof GameRoles] | undefined;
  } = {}
  playerIdRoleGuessedLastNight: number = -1;

  constructor(
    userId: number,
    username: string,
    gameId: number,
  ) {
    super(userId, username, gameId);
  }

  async night(
    server: GameServer,
  ): Promise<void> {
    const playerIds = server.players.filter(p => !this.roleGuesses[p] && p !== this.userId);
    const chosenPlayerId = playerIds[Math.floor(Math.random() * playerIds.length)];
    // TODO: if undefined, return

    await wait(1000 + Math.floor(Math.random() * 5000));

    this.roleGuesses[chosenPlayerId] = server.playerRoles.find(pr => pr.userId === chosenPlayerId)?.role;
    this.playerIdRoleGuessedLastNight = chosenPlayerId;

    console.log('checked player:', chosenPlayerId, 'with role:', this.roleGuesses[chosenPlayerId], this.roleGuesses);

    server.specialStates.sheriffAbility = false;
  }

  async day(server: GameServer): Promise<void> {
    // TODO: check why this function isn't getting called
    await wait(1000 + Math.floor(Math.random() * 3000));

    const player = getUserById(this.playerIdRoleGuessedLastNight);

    console.log(!player
      || server.players.indexOf(this.playerIdRoleGuessedLastNight) === -1
      || this.playerIdRoleGuessedLastNight !== -1);
    if (!player
      || server.players.indexOf(this.playerIdRoleGuessedLastNight) === -1
      || this.playerIdRoleGuessedLastNight !== -1) {
      if (Math.floor(Math.random() * 10) > 4)
        this.sendMessage(this.replies.STARTED.NOT_MUCH[Math.floor(Math.random() * this.replies.STARTED.NOT_MUCH.length)]);;
      return;
    }

    console.log('outside');
    if (isMafiaGameRole(this.roleGuesses[this.playerIdRoleGuessedLastNight])) {
      console.log('inside');
      this.sendMessage(`I'm the Sheriff. I checked ${player?.name} and his role is ${this.roleGuesses[this.playerIdRoleGuessedLastNight]}`);
    }
  }

  handleChat(
    _server: GameServer,
    msgContent: string,
    _authorName: string,
    _authorId: number
  ): void {
    const messageContent = msgContent
      .toLowerCase()
      .replaceAll('\'', '');

    if (this.messageIsMention(messageContent)) {
      const server = getGameServerById(this.serverId);
      if (!server) return;

      // What is the goal/objective?
      if (this.messageContainsKeywords(messageContent, ['what', ['goal', 'objective']])) {
        this.sendMessage('The goal/objective for Citizens is to find and kick all the Mafias; and for the Mafias it is to kill all the citizens.');
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

          this.sendMessage(currentActionText);
        }

        // Who are we voting for/between?
        if (this.messageContainsKeywords(messageContent, ['who', 'voting', ['for', 'between']])) {
          this.sendMessage(`Voting for ${server.votingBetween.map(uid => getUserById(uid)?.name || 'Unnamed user').join(', ') || 'no one'}`);
        }

        // Who is/are mafia(-s)?
        if (this.messageContainsKeywords(messageContent, ['who', ['is', 'are'], 'mafia'])
          || this.messageContainsKeywords(messageContent, ['whos', 'mafia'])
        ) {
          // Who is the voting for?
          this.sendMessage(this.replies.STARTED.WHO_IS_MAFIA[Math.floor(Math.random() * this.replies.STARTED.WHO_IS_MAFIA.length)]);
        }
      } else {
        /* Server hasn't started yet */
        // When is the server starting?
        if (this.messageContainsKeywords(messageContent, ['when', 'start'])) {
          this.sendMessage(this.replies.NOT_STARTED.WHEN_STARTING[Math.floor(Math.random() * this.replies.NOT_STARTED.WHEN_STARTING.length)]);
        }
      }
    }
  }
}

