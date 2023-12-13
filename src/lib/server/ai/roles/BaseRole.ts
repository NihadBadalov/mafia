import { BotMentionRegex, getIncludedRolesForGameAnnouncement } from "$lib";
import { _data } from "$routes/api";
import type { GameServer, UserId } from "$types";
import type { GameRoles } from "$types/GameRoles";
import { GameStates } from "$types/GameStates";
import { io } from '$lib/webSocketConnection';

const REPLIES = {
  STARTED: {
    WHO_IS_MAFIA: [
      'Who is Mafia? I have no idea',
      'No clue who the Mafia are',
      'Wish I\'d known who\'s Mafia...',
      'Who is Mafia? I wish I knew...',
      'You forget a thousand things every day. Make sure this is one of them',
      'Maybe I\'m not the only one who doesn\'t know who\'s Mafia',
      'Maybe I\'m just a bot',
      'Mafia? Who? I don\'t know',
      'Yeah, who is Mafia?'
    ],
  },
  NOT_STARTED: {
    WHEN_STARTING: [
      'Soon, I guess',
      'When the server owner starts',
      'When everyone joins',
      'When the server is full',
      'When we get enough people',
      'Just wait until people join',
      'Just wait until enough people are here',
    ],
  },
  STARTING: [
    'Hell yeah',
    'ok lets go',
    'finally',
    'good luck',
    'glhf',
    'gl',
    'gg to yall',
    'alrighttt',
    'Starting... NOW!!',
    'nice',
    'Epic',
    'I hope we\'ll win',
  ],
};

export default abstract class BaseRole {
  abstract gameRole: typeof GameRoles[keyof typeof GameRoles];
  abstract isMafia: boolean;

  userId: number;
  username: string;
  serverId: number;
  replies = REPLIES;

  suspicionLevel: number = 0;
  isAlive: boolean = true;

  constructor(
    userId: UserId,
    username: string,
    serverId: number,
  ) {
    this.userId = userId;
    this.username = username;
    this.serverId = serverId;
  }

  abstract handleChat(
    server: GameServer,
    messageContent: string,
    authorName: string,
    authorId: number,
  ): void;

  sendMessage(content: string): boolean {
    const server = _data.servers.find(s => s.id === this.serverId);
    if (!server) return false;

    // Player can't chat
    if (!this.isMafia && server.state === GameStates.Night)
      return false;

    // Send message & update chat & play sound
    // Server hasn't started
    if (!server.started) {
      server.citizenChat.push({
        userId: this.userId,
        content: content,
      });
      server.mafiaChat.push({
        userId: this.userId,
        content: content,
      });

      io.emit('serverEvent', {
        message: 'chatMessageFromServerToServer',
        to: 2,
        serverId: server?.id,
        userId: this.userId,
        content: content,
      });
    } else {
      // Server has started
      if (this.isMafia) {
        server.mafiaChat.push({
          userId: this.userId,
          content: content,
        });

        io.emit('serverEvent', {
          message: 'chatMessageFromServerToServer',
          to: 0,
          serverId: server?.id,
          userId: this.userId,
          content: content,
        });
      }
      if (!this.isMafia || (this.isMafia && server.state === GameStates.Day)) {
        server.citizenChat.push({
          userId: this.userId,
          content: content,
        });

        io.emit('serverEvent', {
          message: 'chatMessageFromServerToServer',
          to: 1,
          serverId: server?.id,
          userId: this.userId,
          content: content,
        });
      }
    }

    io.emit('serverEvent', {
      message: 'playSound',
      soundName: 'beep',
      serverId: server?.id,
    });

    // Propagate message to bots
    const rolesToGetMentioned: number[] = getIncludedRolesForGameAnnouncement(
      this.isMafia ?
        server.state === GameStates.Day ?
          'all'
          : 'mafia'
        : 'all'
    );
    for (let i = 0; i < server.bots.length; i++) {
      const bot = server.bots[i];
      if (!rolesToGetMentioned.includes(bot.gameRole)) continue;
      bot.handleChat(server, content, this.username, this.userId);
    }

    return true;
  }

  messageIsMention(messageContent: string): boolean {
    return !!messageContent
      .match(BotMentionRegex)
      ?.[0]
      ?.replaceAll('@', '')
      ?.replaceAll(',', ' ')
      ?.split(/ +/)
      ?.includes('' + this.userId);
  }

  messageContainsKeywords(messageContent: string, keywords: Array<string | string[]>): boolean {
    let allHits = false;

    for (let i = 0; i < keywords.length; i++) {
      if (typeof keywords[i] === 'string') {
        if (!messageContent.includes(keywords[i] as string)) {
          allHits = false;
          break;
        } else {
          allHits = true;
          continue;
        }
      }

      let someHit = false;
      for (let j = 0; j < (keywords[i] as string[]).length; j++) {
        if (messageContent.includes((keywords[i] as string[])[j])) {
          someHit = true;
          break;
        }
      }

      if (!someHit) {
        allHits = false;
        break;
      }
    }

    return allHits;
  }

  gameStarted(): void {
    setTimeout(() =>
      this.sendMessage(REPLIES.STARTING[Math.floor(Math.random() * REPLIES.STARTING.length)]),
      Math.floor(Math.random() * 4000) + 1000
    );
  }

  selfDestruct(): boolean {
    if (_data.users.find(u => u.id === this.userId)) return false;
    _data.users.splice(_data.users.findIndex(u => u.id === this.userId), 1);
    return true;
  }
}

export type BaseRoleType = typeof BaseRole;
export type BaseRoleDerivative<T> = T extends BaseRole ? T : never;

