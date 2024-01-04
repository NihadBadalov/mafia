import { ChatVoteSystemMessage, SheriffCondemnationMessage, SheriffProposalToKick, getGameServerById, getUserById, getUserRoleInServer, isMafiaGameRole } from "$lib";
import type { GameServer } from "$types";
import { GameRoles } from "$types/GameRoles";
import { GameStates } from "$types/GameStates";
import BaseRole from "../BaseRole";
import { setTimeout as wait } from 'timers/promises';

export class Doctor extends BaseRole {
  gameRole: Exclude<GameRoles, GameRoles.Unknown> = GameRoles.Doctor;
  isMafia = false;
  possibleSheriffPlayerIds: number[] = [];
  realSheriffId: number | undefined;
  impersonators: number[] = [];

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

  override async gameStarted(): Promise<void> {
    await wait(Math.floor(Math.random() * 4_000) + 1_000);
    await this.sendMessage(this.replies.STARTING[Math.floor(Math.random() * this.replies.STARTING.length)]);

    await wait(Math.floor(Math.random() * 2_000) + 6_500);
    if (!this.possibleSheriffPlayerIds.length)
      await this.sendMessage(this.replies.STARTED.ROLE[this.gameRole][Math.floor(Math.random() * this.replies.STARTED.ROLE[this.gameRole].length)]);
    else
      await this.sendMessage(this.replies.STARTED.ROLE[this.gameRole][Math.floor(Math.random() * this.replies.STARTED.ROLE[this.gameRole].length)]);
  }

  async night(server: GameServer): Promise<void> {
    if (!server) {
      return;
    }

    // Filter out existing Sheriffs
    for (let i = 0; i < this.possibleSheriffPlayerIds.length; i++) {
      if (server.players.indexOf(
        this.possibleSheriffPlayerIds[i]) === -1) {
        this.possibleSheriffPlayerIds.splice(i, 1);
      }
    }

    if (this.possibleSheriffPlayerIds.length > 0) {
      await this.vote(this.possibleSheriffPlayerIds[0]);
    }
    await this.vote(this.userId);
  }

  /**
   * Voting
   * @param server - server
   */
  async day(): Promise<void> {
    setTimeout(async () => {
      await this.sendMessage(this.replies.STARTED.NOT_MUCH[Math.floor(Math.random() * this.replies.STARTED.NOT_MUCH.length)]);
    }, 500 + Math.floor(Math.random() * 1000));

    await wait(4_000 + Math.floor(Math.random() * 2_000));

    if (!this.impersonators.length) return;

    const impersonator = getUserById(this.impersonators.shift());
    if (!impersonator) return;

    const couldVote = await this.vote(impersonator.id);
    if (!couldVote) return;

    await this.sendMessage(`I voted for ${impersonator.name} (@${impersonator.id}) because he said he was the doctor. I am the real Doctor.`);
  }

  async handleChat(
    server: GameServer,
    msgContent: string,
    authorName: string,
    authorId: number
  ): Promise<void> {
    const messageContent = msgContent
      .toLowerCase()
      .replaceAll('\'', '');


    if (server.state === GameStates.Day) {
      // Sheriff: proposal to kick mafia
      const author = getUserById(authorId);

      if (!author) return;

      // Sheriff: condemnation message
      const sheriffCondemnationMatches = messageContent.match(SheriffCondemnationMessage);
      if (sheriffCondemnationMatches?.[1] && !Number.isNaN(sheriffCondemnationMatches?.[1])) {
        this.possibleSheriffPlayerIds = [];
        this.realSheriffId = authorId;
      }

      // Sheriff: proposal to kick
      const sheriffProposalMatches = messageContent.match(SheriffProposalToKick);
      if (sheriffProposalMatches?.[1] && !Number.isNaN(sheriffProposalMatches?.[1])) {
        this.possibleSheriffPlayerIds.push(authorId);

        await wait(1_000 + Math.floor(Math.random() * 5_000));
        await this.sendMessage(this.replies.STARTED.ROGER[Math.floor(Math.random() * this.replies.STARTED.ROGER.length)]);

        await wait(1_000 + Math.floor(Math.random() * 1_500));
        await this.vote(+sheriffProposalMatches[1]);
      }

      // Sheriff: Sheriff saying he needs to get healed at night
      if (messageContent === 'sheriff. whoever is doctor, you should heal me at night') {
        const roleHealChance = isMafiaGameRole(getUserRoleInServer(authorId))
          ? 0.1
          : 0.95;
        const willHeal = Math.floor(Math.random() * 100) / 100 <= roleHealChance;
        if (willHeal) this.possibleSheriffPlayerIds.push(authorId);
      }
      else if (this.messageContainsKeywords(messageContent, ['not the sheriff', 'i am the sheriff'])) {
        this.possibleSheriffPlayerIds.unshift(authorId);
      }

      // Someone is impersonating us
      if (this.userId !== authorId && this.messageContainsKeywords(messageContent, ['i', ['im', 'am'], 'doctor']) && !messageContent.includes('heal me')) {
        await this.sendMessage(`@${authorId} ${authorName} is not the Doctor. I am the Doctor. He is lying. Let's kick him.`);
        this.impersonators.unshift(authorId);
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
          await wait(1_000 + Math.floor(Math.random() * 2_500));

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

