import { ChatVoteSystemMessage, ImpostorDoctorMessage, ImpostorSheriffMessage, SheriffProposalToKick, SuspicionMessage, getGameServerById, getUserById, getUserRoleInServer, isMafiaGameRole } from "$lib";
import type GameServer from "$lib/server/GameServer";
import { GameRoles } from "$types/GameRoles";
import { GameStates } from "$types/GameStates";
import BaseRole from "../BaseRole";
import { setTimeout as sleep } from 'timers/promises';

export class Citizen extends BaseRole {
  gameRole: Exclude<GameRoles, GameRoles.Unknown> = GameRoles.Citizen;
  isMafia = false;
  possibleSheriffPlayerIds: number[] = [];
  realSheriffId: number | undefined;

  constructor(
    ast: string,
    userId: number,
    username: string,
    gameId: number,
    urlOrigin: URL['origin'],
  ) {
    super(ast, userId, username, gameId, urlOrigin);

    const dataServer = getGameServerById(gameId);
    this.realSheriffId = dataServer?.playerRoles.find(pr => getUserRoleInServer(pr.userId) === GameRoles.Sheriff)?.userId;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async day(): Promise<void> {
    setTimeout(async () => {
      await this.sendMessage(this.replies.STARTED.NOT_MUCH[Math.floor(Math.random() * this.replies.STARTED.NOT_MUCH.length)]);
    }, 500 + Math.floor(Math.random() * 1_000));
  }

  async handleChat(
    server: GameServer,
    msgContent: string,
    _authorName: string,
    authorId: number
  ): Promise<void> {
    const messageContent = msgContent
      .toLowerCase()
      .replaceAll('\'', '');

    if (server.state === GameStates.Day) {
      const author = getUserById(authorId);
      if (!author) return;

      // Sheriff: let's kick the fake Sheriff
      const sheriffSuspicionMessage = messageContent.match(ImpostorSheriffMessage);
      if (
        sheriffSuspicionMessage?.[1]
        && !Number.isNaN(sheriffSuspicionMessage?.[1])
      ) {
        await sleep(1_000 + Math.floor(Math.random() * 1_000));

        await this.sendMessage(`Sure, voting for ${sheriffSuspicionMessage[1]}.`);
        await this.vote(+sheriffSuspicionMessage[1]);
      }

      // Doctor: let's kick the fake Doctor
      const doctorSuspicionMessage = messageContent.match(ImpostorDoctorMessage);
      if (
        doctorSuspicionMessage?.[1]
        && !Number.isNaN(doctorSuspicionMessage?.[1])
      ) {
        await sleep(1_000 + Math.floor(Math.random() * 1_000));

        await this.sendMessage(`Sure, voting for ${doctorSuspicionMessage[1]}.`);
        await this.vote(+doctorSuspicionMessage[1]);
      }

      // Someone's suspecting someone
      const suspicionMessage = messageContent.match(SuspicionMessage);
      if (
        suspicionMessage?.[1]
        && !Number.isNaN(suspicionMessage?.[1])
      ) {
        await sleep(1_000 + Math.floor(Math.random() * 1_500));

        const suspectUserId = +suspicionMessage[1];

        if (suspectUserId === this.userId) {
          // We are being suspected
          const possibleReplies = this.replies.STARTED.GOT_SUSPECTED.GENERAL
            .concat(this.replies.STARTED.GOT_SUSPECTED?.[this.gameRole]);

          await this.sendMessage(possibleReplies[Math.floor(Math.random() * possibleReplies.length)]);
        } else {
          const willVote = Math.floor(Math.random() * 100) > 35;
          console.log(`Bot ${this.userId} is willingToVote? ${willVote}`);
          if (Math.floor(Math.random() * 100) > 35) await this.sendMessage(`${willVote ? 'Yep' : 'Nope'},${willVote ? '' : ' not'} voting for them.`);
          if (willVote) await this.vote(suspectUserId);
        }
      }

      // Sheriff: porposal to kick
      const sheriffProposalMatches = messageContent.match(SheriffProposalToKick);
      if (sheriffProposalMatches?.[1] && !Number.isNaN(sheriffProposalMatches?.[1])) {
        await sleep(1_000 + Math.floor(Math.random() * 5_000));
        await this.sendMessage(this.replies.STARTED.ROGER[Math.floor(Math.random() * this.replies.STARTED.ROGER.length)]);

        await sleep(1_000 + Math.floor(Math.random() * 1_500));
        await this.vote(+sheriffProposalMatches[1]);
      }

      // Sheriff (100% sheriff through _data):
      // voting for someone
      const sheriffHiddenProposalMatches = messageContent.match(ChatVoteSystemMessage);
      if (
        sheriffHiddenProposalMatches?.[1] && !Number.isNaN(sheriffHiddenProposalMatches?.[1])
        && sheriffHiddenProposalMatches?.[2] && !Number.isNaN(sheriffHiddenProposalMatches?.[2])
        // The real sheriff (from _data)
        && +sheriffHiddenProposalMatches[2] === this.realSheriffId
      ) {
        const dataServer = getGameServerById(server.id);

        if (
          server.sheriffHasChecked.includes(+sheriffHiddenProposalMatches[2])
          && isMafiaGameRole(dataServer?.playerRoles?.find(pr => pr.userId === +sheriffHiddenProposalMatches[2])?.role)
        ) {
          await this.vote(+sheriffHiddenProposalMatches[2]);
          await sleep(1_000 + Math.floor(Math.random() * 2_500));

          const targetUser = getUserById(+sheriffHiddenProposalMatches[2]);
          if (targetUser) await this.sendMessage(`I'm going to vote for ${targetUser.name} (${targetUser.id}), too!`);
        }
      }
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
          const currentActionText = 'Current action: ' + (() => {
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
              return 'Game ended, join a new one!';
            }
          })();

          await this.sendMessage(currentActionText);
        }

        // Who are we voting for/between?
        if (this.messageContainsKeywords(messageContent, ['who', 'voting', ['for', 'between']])) {
          await this.sendMessage(`Voting for ${server.votingBetween.map(uid => getUserById(uid)?.name ?? 'Unnamed user').join(', ') || 'no one'}`);
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

