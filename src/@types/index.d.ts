import type GameServer from '$lib/server/GameServer';
import type SuspicionGroup from '$lib/server/ai/SuspicionGroup';
import type { BaseRoleDerivative } from '$lib/server/ai/roles/BaseRole';
import type BaseRole from '$lib/server/ai/roles/BaseRole';
import type { GameRoles } from './GameRoles';
import type { GameStates } from './GameStates';

export type UserId = number;

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
  timestamp: number;
}
export type Chat = Array<ChatMessage>;

export type Votes = {
  for: UserId;
  by: UserId;
};

