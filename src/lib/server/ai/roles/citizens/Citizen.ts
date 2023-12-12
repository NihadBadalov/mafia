import { getGameServerById, getUserById } from "$lib";
import type { GameServer } from "$types";
import { GameRoles } from "$types/GameRoles";
import { GameStates } from "$types/GameStates";
import BaseRole from "../BaseRole";

export class Citizen extends BaseRole {
  readonly gameRole = GameRoles.Citizen;
  readonly isMafia = false;

  handleChat(server: GameServer, msgContent: string, authorName: string, authorId: number): void {
    const messageContent = msgContent
      .toLowerCase()
      .replaceAll('\'', '');

    if (this.messageIsMention(messageContent)) {
      const server = getGameServerById(this.serverId);
      if (!server) return;

      /*
        * TODO:
      * 1. Handle "when is the game starting" - This message could be handled by checking if the server has a start time set and if it's not already started. If
        so, the AI could reply with an estimated start time based on the server's current time.
      * 2. Handle "who is playing" - This message could be handled by querying the server for a list of players and their roles, and then replying with that 
        information.
      * 3. Handle "what is the goal" - This message could be handled by checking if the server has a goal set, and if so, replying with the goal's text.
      * 4. Handle "where is the objective" - This message could be handled by querying the server for the objective location and then replying with that 
        information.
      * 5. Handle "who is the mafia" - This message could be handled by querying the server for the list of mafia members and their roles, and then replying 
        with that information.
      * 10. Handle "who is the last to act" - This message could be handled by querying the server for the last player to act, and then replying with that 
        information
      */
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
          // Who is the voting for?
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

  constructor(
    userId: number,
    username: string,
    gameId: number,
  ) {
    super(userId, username, gameId);
  }
}

