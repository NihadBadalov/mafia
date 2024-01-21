import type GameServer from '$lib/server/GameServer';

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

// eslint-disable-next-line
export interface ModifiedServerData extends ServerData {
  // eslint-disable-next-line
  [key: string]: any;
}

export interface ChatMessage {
  id: number;
  userId: UserId;
  content: string;
  timestamp: number;
}
export type Chat = ChatMessage[];

export interface Votes {
  for: UserId;
  by: UserId;
}

