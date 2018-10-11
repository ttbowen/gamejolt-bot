import { LogLevel } from './LogLevel';

/**
 * Options that are provided to the bot client constructor
 *
 * @typedef {object} BotOptions
 * @property {string} [name] The name of the bot
 * @property {string} [version] The current bot version
 * @property {number[]} [ownerIds] Owner user Id numbers
 * @property {string} [commandsDir] Directory command modules are located
 * @property {string} [configPath] Path to bot configurations
 * @property {number[]} [defaultRooms] Default rooms to join on startup
 * @property {boolean} [acceptFriendRequests] Flags whether to accept friend requests
 * @property {number} [acceptFriendRequestInterval] The rate to accept friend requests in milliseconds
 * @property {number} [rateLimitInterval]
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
