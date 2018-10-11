import { LogLevel } from './LogLevel';

/**
 * Options that are provided to the bot client constructor.
 */
export type BotOptions = {
  name: string;
  version?: string;
  ownerIds: number[];
  commandsDir: string;
  configPath: string;
  defaultRooms?: number[];
  defaultPrefix?: string;
  acceptFriendRequests?: boolean;
  acceptFriendRequestInterval?: number;
  rateLimitInterval?: [number, number];
  pause?: boolean;
  logLevel?: LogLevel;
};
