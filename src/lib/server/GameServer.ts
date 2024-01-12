import { arrayShuffle, getUserRoleInServer, isMafiaGameRole } from '$lib';
import type { Chat, ChatMessage, UserId, Votes } from '$types';
import { GameRoles } from '$types/GameRoles';
import { GameStates } from '$types/GameStates';
import SuspicionGroup from './ai/SuspicionGroup';
import type BaseRole from './ai/roles/BaseRole';
import type { BaseRoleDerivative } from './ai/roles/BaseRole';
import { setTimeout as sleep } from 'timers/promises';

export default class GameServer {
  id: number;
  name: string;
  maxPlayerCount: number;
  mafiaCount: number;
  playingSong: string | undefined;

  fillWithBots: boolean;
  bots: BaseRoleDerivative<BaseRole>[];
  suspicionGroups: SuspicionGroup[];

  players: UserId[];
  initialPlayers: UserId[];
  playerBlacklist: UserId[];
  playerRoles: { userId: UserId; role: typeof GameRoles[keyof typeof GameRoles] | number }[];

  ownerId: UserId;
  started: boolean;
  state: GameStates;
  specialStates: {
    sheriffAbility: boolean;
    doctorAbility: boolean;
  };

  announcements: {
    [key: typeof GameRoles[keyof typeof GameRoles] | number]: string;
  };
  citizenChat: Chat;
  mafiaChat: Chat;
  playersCanChat: boolean;

  whoCanVoteKick: number[];
  votingBetween: number[];
  votes: {
    don: number | undefined;
    doctor: number | undefined;
    mafia: Votes[];
    citizens: Votes[];
  };
  sheriffHasChecked: UserId[];

  totalTimerSeconds: number | undefined;
  timer: number | undefined;


  constructor(
    newServerId: number,
    serverName: string,
    maxPlayerAmount: number,
    amountOfMafia: number,
    fillWithBots: boolean,
    ownerId: UserId,
  ) {
    this.id = newServerId;
    this.name = serverName;
    this.maxPlayerCount = maxPlayerAmount;
    this.mafiaCount = amountOfMafia;
    this.playingSong = undefined;

    this.fillWithBots = fillWithBots;
    this.bots = [];
    this.suspicionGroups = [];

    this.players = [];
    this.initialPlayers = [];
    this.playerRoles = [];
    this.playerBlacklist = [];

    this.ownerId = ownerId;
    this.started = false;
    this.state = GameStates.Waiting;
    this.specialStates = {
      sheriffAbility: false,
      doctorAbility: false,
    };

    this.announcements = {
      [GameRoles.Mafia]: '',
      [GameRoles.Don]: '',
      [GameRoles.Citizen]: '',
      [GameRoles.Doctor]: '',
      [GameRoles.Sheriff]: '',
    };
    this.citizenChat = [];
    this.mafiaChat = [];
    this.playersCanChat = true;

    this.votingBetween = [];
    this.whoCanVoteKick = [];
    this.votes = {
      don: undefined,
      doctor: undefined,
      mafia: [],
      citizens: [],
    };
    this.sheriffHasChecked = [];

    this.totalTimerSeconds = undefined;
    this.timer = undefined;

    this.tick();
  }

  async tick() {
    // More than 5 seconds since the last message
    if ((this.citizenChat.at(-1)?.timestamp ?? 0) - Date.now() > 5_000) {
      const eligiblePlayers = arrayShuffle([...this.players]);

      let suspectedPlayer: UserId = -1;
      for (let i = 0; i < eligiblePlayers.length; i++) {
        const triggerMessage = !this.citizenChat.findLast(
          message => message.userId === eligiblePlayers[i] && message.timestamp > 20_000
        );

        if (triggerMessage) {
          suspectedPlayer = eligiblePlayers[i];
          break;
        }
      }

      // Create suspicion group
      if (suspectedPlayer !== -1) {
        const suspicionGroup = new SuspicionGroup(suspectedPlayer, GameRoles.Mafia);
        this.suspicionGroups.unshift(suspicionGroup);

        const citizenPlayerIDs = arrayShuffle(this.playerRoles).find(uid => !isMafiaGameRole(getUserRoleInServer(uid)));
        suspicionGroup.attach(citizenPlayerIDs[Math.floor(Math.random() * citizenPlayerIDs.length)]);
      }
    }

    await sleep(1_000);
    if (this.state !== GameStates.Ended) await this.tick();
  }

  /**
   * Returns last sent message by user
   */
  playerLastChattedMessage(userId: UserId): ChatMessage | undefined {
    const citizenChatMessage = this.citizenChat.find(message => message.userId === userId);
    const mafiaChatMessage = this.mafiaChat.find(message => message.userId === userId);
    return citizenChatMessage || mafiaChatMessage;
  }
}
