import { arrayShuffle, getUserRoleInServer, isMafiaGameRole } from '$lib';
import type { Chat, ChatMessage, UserId, Votes } from '$types';
import { GameRoles } from '$types/GameRoles';
import { GameStates } from '$types/GameStates';
import SuspicionGroup from './ai/SuspicionGroup';
import type BaseRole from './ai/roles/BaseRole';
import type { BaseRoleDerivative } from './ai/roles/BaseRole';
import { setTimeout as sleep } from 'timers/promises';
import { _data } from '$routes/api';
import { UserObservableArray } from '$utils/UserObservableArray';

export default class GameServer {
  id: number;
  name: string;
  maxPlayerCount: number;
  mafiaCount: number;
  playingSong: string | undefined;

  fillWithBots: boolean;
  bots: BaseRoleDerivative<BaseRole>[];
  suspicionGroups: SuspicionGroup[];

  players: UserObservableArray<UserId>;
  initialPlayers: UserId[];
  playerBlacklist: UserId[];
  playerRoles: { userId: UserId; role: typeof GameRoles[keyof typeof GameRoles] | number }[];

  ownerId: UserId;
  started: boolean;
  state: GameStates;
  specialStates: {
    sheriffAbility: boolean;
    doctorAbility: boolean;
    playerIdsRevealingRoles: UserId[];
  };

  announcements: Record<typeof GameRoles[keyof typeof GameRoles] | number, string>;
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

  /**
    * Tick -> 10 -> 0 -> 10 ...
    * 0: 0 -> 10
    * 1: 10 -> 0
    */
  #tickDirection: 0 | 1 = 0;
  #tickCounter: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 = 0;
  #suspicionDebounce = false;


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

    this.players = new UserObservableArray();
    this.initialPlayers = [];
    this.playerRoles = [];
    this.playerBlacklist = [];

    this.ownerId = ownerId;
    this.started = false;
    this.state = GameStates.Waiting;
    this.specialStates = {
      sheriffAbility: false,
      doctorAbility: false,
      playerIdsRevealingRoles: [],
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


    this.players.on('userKick', (userId: number) => {
      const suspicionGroupIndex = this.suspicionGroups.findIndex(spGroup => {
        spGroup.suspecting === userId
      });
      if (suspicionGroupIndex !== -1) {
        this.suspicionGroups.splice(suspicionGroupIndex, 1);
      }
    });

    this.tick();
  }

  private checkForExistance() {
    return !!_data.servers.find(s => s.id);
  }

  private async tick(): Promise<void> {
    if (this.state === GameStates.Waiting) {
      await sleep(1_000);
      return this.tick();
    }

    // Ticks
    if (this.#tickDirection == 0) {
      this.#tickCounter += 1;
      if (this.#tickCounter === 10) this.#tickDirection = 1;
    }
    else {
      this.#tickCounter -= 1;
      if (this.#tickCounter === 0) this.#tickDirection = 0;
    }

    // Let gc collect us if we do not exist
    if (this.#tickCounter % 10 == 0 && this.checkForExistance() === false) return;


    console.log('tick test');
    // More than 5 seconds since the last message
    console.log(
      !!this.citizenChat.at(-1)?.timestamp,
      Date.now() - (this.citizenChat.at(-1)?.timestamp ?? 0) > 5_000,
      Date.now() - (this.citizenChat.at(-1)?.timestamp ?? 0) !== Date.now()
    );
    if (
      !this.#suspicionDebounce
      && this.state === GameStates.Day
      && !!this.citizenChat.at(-1)?.timestamp
      && Date.now() - (this.citizenChat.at(-1)?.timestamp ?? 0) > 5_000
      && Date.now() - (this.citizenChat.at(-1)?.timestamp ?? 0) !== Date.now()
      && this.suspicionGroups.length < 3
    ) {
      this.#suspicionDebounce = true;

      const eligiblePlayers = arrayShuffle([...this.players.filter(pid => !this.suspicionGroups.find(spGroup => spGroup.suspecting === pid))]);
      console.log('eligibles', eligiblePlayers);

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

      setTimeout(() => {
        this.#suspicionDebounce = false;
      }, 6000);
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
    return citizenChatMessage ?? mafiaChatMessage;
  }
}

