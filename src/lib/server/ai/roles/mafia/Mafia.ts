import { MafiaProposalToKill, SheriffProposalToKick, arrayShuffle, getGameServerById, getUserById, getUserRoleInServer, isMafiaGameRole } from "$lib";
import type { GameServer } from "$types";
import { GameRoles } from "$types/GameRoles";
import { GameStates } from "$types/GameStates";
import BaseRole from "../BaseRole";
import { setTimeout as wait } from 'timers/promises';

export class Mafia extends BaseRole {
  gameRole: Exclude<GameRoles, GameRoles.Unknown> = GameRoles.Mafia;
  isMafia = true;
  mafiaIds: number[] = [];
  currentlyVotingFor: number = -1;
  possibleSheriff: number = -1;
  possibleDoctor: number = -1

  constructor(
    ast: string,
    userId: number,
    username: string,
    gameId: number,
    urlOrigin: URL['origin'],
  ) {
    super(ast, userId, username, gameId, urlOrigin);

    const server = getGameServerById(this.serverId);
    if (!server) return;

    for (let i = 0; i < server.bots.length; i++) {
      const bot = server.bots[i];
      if (bot?.isMafia) this.mafiaIds.push(bot.userId);
    }
  }

  async night(server: GameServer): Promise<void> {
    await wait(1_000 +
      // If we have a possible sheriff or a doctor, skip long waiting
      (this.possibleSheriff + this.possibleDoctor !== -2 ? 0 : Math.floor(Math.random() * 5_000)
      ));

    const userVotingFor = this.currentlyVotingFor !== -1
      ? getUserById(this.currentlyVotingFor)
      : undefined;

    // We already have someone to vote for
    if (this.currentlyVotingFor !== -1 && userVotingFor) {
      await this.sendMessage(`Same. Going to vote for ${userVotingFor?.name} with ID ${userVotingFor?.id}`);
      await this.vote(userVotingFor?.id);
      this.currentlyVotingFor = -1;
    }
    // Nobody to vote for
    else {
      const playerIdToVoteFor = (this.possibleSheriff + this.possibleDoctor !== -2
        ? (this.possibleDoctor !== -1 ? [this.possibleDoctor] : [this.possibleSheriff])
        : arrayShuffle(server.votingBetween.filter(p => !isMafiaGameRole(getUserRoleInServer(p)))))[0];
      const playerToVoteFor = getUserById(playerIdToVoteFor);

      if (!playerToVoteFor) {
        await this.sendMessage('I don\'t have anybody to vote for');
        return;
      }

      await this.sendMessage(`Let's vote for ID ${playerToVoteFor.id}. That's the guy with username ${playerToVoteFor.name}`);
      await this.vote(playerToVoteFor.id);

      if (this.possibleDoctor === this.currentlyVotingFor) this.possibleDoctor = -1;
      if (this.possibleSheriff === this.currentlyVotingFor) this.possibleSheriff = -1;
      this.currentlyVotingFor = -1;
    }
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


    // Day/Night
    if (server.state === GameStates.Night) {
      const author = getUserById(authorId);
      if (!author) return;

      if (isMafiaGameRole(getUserRoleInServer(author?.id))) {
        // Mafia: proposal to kill somebody
        const mafiaProposalMatches = messageContent.match(MafiaProposalToKill);
        if (mafiaProposalMatches?.[1] && !Number.isNaN(mafiaProposalMatches?.[1])) {
          this.currentlyVotingFor = +mafiaProposalMatches[1];
        }
      }
    }
    else {
      // Sheriff: proposal to kick somebody
      const sheriffProposalMatches = messageContent.match(SheriffProposalToKick);
      console.log('sheriff proposal, handling by mafia');
      if (sheriffProposalMatches?.[1] && !Number.isNaN(sheriffProposalMatches?.[1])) {
        console.log('inside');
        await wait(3_000 + Math.floor(Math.random() * 6_000));

        const votes: { [key: number]: number } = {};
        for (let i = 0; i < server.votes.citizens.length; i++) {
          const vote = server.votes.citizens[i];
          if (isMafiaGameRole(getUserRoleInServer(vote.for))) continue;
          votes[vote.for] = votes[vote.for] ? votes[vote.for] + 1 : 1;
        }

        let mostVoted = [0, 0];
        for (const [id, votesAmount] of Object.entries(votes)) {
          if (votesAmount > mostVoted[1]) {
            mostVoted[0] = +id;
            mostVoted[1] = votesAmount;
          }
        }

        await this.vote(mostVoted[0]);
      }

      // Someone says they're a Sheriff or a Doctor
      if (!server.bots.find(b => b.userId === authorId)?.isMafia) {
        if (messageContent.includes('i am the doctor.')) {
          this.possibleDoctor = authorId;
        }
        else if (messageContent.includes('i am the sheriff.')) {
          this.possibleSheriff = authorId;
        }
      }
    }


    // The bot has been mentioned
    if (this.messageIsMention(messageContent)) {
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

