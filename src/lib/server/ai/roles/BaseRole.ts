import { BotMentionRegex } from "$lib";
import type GameServer from "$lib/server/GameServer";
import { _data } from "$routes/api";
import type { UserId } from "$types";
import { GameRoles } from "$types/GameRoles";
import { setTimeout as sleep } from "timers/promises";

const REPLIES = {
  STARTED: {
    GOT_SUSPECTED: {
      GENERAL: [
        'I swear to God it\'s not me',
        'I swear it\'s not me',
      ],
      [GameRoles.Sheriff]: [
        'I\'m the Sheriff',
        'I\'m the sheriff',
        'I\'m a Doctor',
      ],
      [GameRoles.Citizen]: [
        'I am a citizen',
        'I am a Citizen',
      ],
      [GameRoles.Doctor]: [
        'I\'m the Doctor',
        'I\'m the doctor',
      ],
      [GameRoles.Mafia]: [
        'I\'m a citizen',
        'I\'m a Citizen',
      ],
      [GameRoles.Don]: [
        'I\'m a citizen',
        'I\'m a Citizen',
      ],
    },
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
    NOT_MUCH: [
      'So...',
      'So, what\'s up?',
      'What we doing?',
      'Anyone got suspicions?',
      'Noice.',
    ],
    ROGER: [
      'Roger-dodger, dispatch!',
      'Copy that', 'copy that',
      'understood', 'Understood',
      'Got it', 'Gotcha',
      'Gotcha, gotcha',
      'Good call!', 'Alright',
      'A\'ighty!', 'okey-dokey',
      'ok', 'Ok', 'Alr', 'alr', 'Sure',
      'let\'s gooooo', 'i\'m fine with that',
      'I hear you', 'i hear you',
      'hm ok', 'Hmmmm. Alr',
      'Mkay', 'Okay', 'Ok', 'Mk.',
    ],
    ROLE: {
      [GameRoles.Mafia]: [
        'I\'m the Sheriff',
        'Sheriff',
        'I\'m INNOCENT. Haha. Kidding, civilian.',
        'I am the mafia. Just kidding lol',
        'Civ',
        'civ',
        'civilian',
        'Civilian',
        'Civilian, I guess',
        'I\'m new but I think I\'m a civ',
        'I\'m new but I think I\'m a civilian',
        'I\'m new but I think I\'m civ',
        'I\'m new but I think I\'m civilian',
      ],
      [GameRoles.Don]: [
        'I\'m the Sheriff',
        'Sheriff',
        'I\'m INNOCENT. Haha. Kidding, civilian.',
        'I am the mafia. Just kidding lol',
        'Civ',
        'civ',
        'civilian',
        'Civilian',
        'Civilian, I guess',
        'I\'m new but I think I\'m a civ',
        'I\'m new but I think I\'m a civilian',
      ],
      [GameRoles.Citizen]: [
        'I\'m INNOCENT. Haha. Kidding, civilian.',
        'Civ',
        'civ',
        'civilian',
        'Civilian',
        'Civilian, I guess',
        'I\'m new but I think I\'m a civ',
        'I\'m new but I think I\'m a civilian',
      ],
      [GameRoles.Doctor]: [
        'Doctor',
        'Doc',
        'I\'m a civilian, who\'s the doctor?',
        'I\'m a civilian; doctor, can you heal me at night, please?',
        'I\'m INNOCENT. Haha. Kidding, civilian.',
        'Civ',
        'civ',
        'civilian',
        'Civilian',
        'Civilian, I guess',
        'I\'m new but I think I\'m a civ',
        'I\'m new but I think I\'m a civilian',
      ],
      [GameRoles.Sheriff]: [
        'I\'m the Sheriff',
        'Sheriff',
        'I\'m the Sheriff; Doctor, heal me at night',
        'Sheriff. WHOEVER IS DOCTOR, you should heal me at night',
        'Civilian. Doctor, heal me at night',
      ],
    },
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
  abstract gameRole: Exclude<GameRoles, GameRoles.Unknown>;
  abstract isMafia: boolean;

  ast: string;
  userId: number;
  username: string;
  serverId: number;
  urlOrigin: URL['origin'];

  replies = REPLIES;
  isAlive = true;

  constructor(
    ast: string,
    userId: UserId,
    username: string,
    serverId: number,
    urlOrigin: URL['origin'],
  ) {
    this.ast = ast;
    this.userId = userId;
    this.username = username;
    this.serverId = serverId;
    this.urlOrigin = urlOrigin;
  }

  abstract handleChat(
    server: GameServer,
    msgContent: string,
    authorName: string,
    authorId: number,
  ): void;

  async night?(server: GameServer): Promise<void>;
  async day?(server: GameServer): Promise<void>;

  async vote(userId: number) {
    const server = _data.servers.find(s => s.id === this.serverId);
    const voteEndpoint = server
      ?.specialStates?.sheriffAbility
      ? "sheriffAbility"
      : server?.specialStates
        ?.doctorAbility
        ? "doctorAbility"
        : "vote";

    return fetch(`${this.urlOrigin}/api/servers/${this.serverId}/${voteEndpoint}`, {
      method: "POST",
      body: JSON.stringify({
        targetUserId: userId,
        userId: this.userId,
        ast: this.ast,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    } as RequestInit)
      .then(() => true)
      .catch(() => false);
  }

  async sendMessage(content: string): Promise<boolean> {
    return fetch(`${this.urlOrigin}/api/servers/${this.serverId}/gameChat`, {
      method: "POST",
      body: JSON.stringify({
        message: content,
        userId: this.userId,
        ast: this.ast,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    } as RequestInit)
      .then(() => true)
      .catch(() => false);
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

  messageContainsKeywords(messageContent: string, keywords: (string | string[])[]): boolean {
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

  async gameStarted(): Promise<void> {
    await sleep(Math.floor(Math.random() * 4_000) + 1_000);
    await this.sendMessage(REPLIES.STARTING[Math.floor(Math.random() * REPLIES.STARTING.length)]);

    await sleep(Math.floor(Math.random() * 4_000) + 2_500);
    await this.sendMessage(REPLIES.STARTED.ROLE[this.gameRole][Math.floor(Math.random() * REPLIES.STARTED.ROLE[this.gameRole].length)]);
  }

  selfDestruct(): boolean {
    if (_data.users.find(u => u.id === this.userId)) return false;
    _data.users.splice(_data.users.findIndex(u => u.id === this.userId), 1);

    const server = _data.servers.find(s => s.id === this.serverId);
    if (server) {
      server.bots.splice(server.bots.findIndex(b => b.userId === this.userId), 1);
    }

    return true;
  }

  async suspect(userId: UserId) {
    const user = _data.users.find(u => u.id === userId);
    if (!user) return;

    await sleep(Math.floor(Math.random() * 1_000) + 1_000);
    await this.sendMessage(`I suspect ${user.name} (@${user.id}). Let's kick him out`);
    await this.vote(user.id);
  }
}

export type BaseRoleType = typeof BaseRole;
export type BaseRoleDerivative<T> = T extends BaseRole ? T : never;

