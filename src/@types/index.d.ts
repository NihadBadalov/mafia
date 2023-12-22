import type { BaseRoleDerivative } from '$lib/server/ai/roles/BaseRole';
import type BaseRole from '$lib/server/ai/roles/BaseRole';
import type { GameRoles } from './GameRoles';
import type { GameStates } from './GameStates';

export type UserId = number;

export interface GameServer {
  id: number;
  name: string;
  maxPlayerCount: number;
  mafiaCount: number;

  fillWithBots: boolean;
  bots: BaseRoleDerivative<BaseRole>[],

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

  totalTimerSeconds: number | undefined;
  timer: number | undefined;
}

export interface User {
  id: UserId;
  name: string;
}

export interface UserAccessToken {
  id: UserId;
  token: string;
}

export interface ServerData {
  servers: GameServer[];
  users: User[];
  userAsts: UserAccessToken[] | undefined;
  serverPassphrase: string | undefined;
}

export interface ModifiedServerData extends ServerData {
  [key: string]: any;
}

export interface ChatMessage {
  userId: UserId;
  content: string;
}
export type Chat = Array<ChatMessage>;

export type Votes = {
  for: UserId;
  by: UserId;
};

