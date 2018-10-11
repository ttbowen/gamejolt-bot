import * as GameJolt from 'gamejolt.js';
import * as path from 'path';
import * as fs from 'fs';
import * as nconf from 'nconf';

import { User, Room, PublicRooms, UserCollection, Message, SiteUser } from 'gamejolt.js';

import { BotOptions } from '../../types/BotOptions';
import { ClientOptions } from '../../types/ClientOptions';
import { Command } from '../../command/Command';
import { CommandDispatcher } from '../../command/CommandDispatcher';
import { CommandLoader } from '../../command/CommandLoader';
import { CommandStorage } from '../../command/CommandStorage';
import { ListenerDecorators } from '../../util/Listener/ListenerDecorators';
import { ConsoleLogger } from '../../util/Logger/ConsoleLogger';
import { consoleLogger } from '../../util/Logger/ConsoleLoggerDecorator';
import { CommandRateLimiter } from '../../command/CommandRateLimiter';
import { Middleware } from '../../types/Middleware';
import { RedisProvider } from '../../storage/database/RedisProvider';

const { on, once, registerListeners } = ListenerDecorators;

/**
 *
 * The bot client which provides access to chat and api.
 * This extends the gamejolt.js Client functionality
 *
 * @export
 * @class Client
 * @extends {GameJolt.Client}
 */
export class Client extends GameJolt.Client {
  /**
   *
   * The name of the bot
   * @type {string}
   * @memberof Client
   */
  public readonly name: string;

  /**
   *
   * The version of the bot
   * @type {string}
   * @memberof Client
   */
  public readonly version: string;

  /**
   *
   * Owner Ids for this bot
   * @type {number[]}
   * @memberof Client
   */
  public readonly owners: number[];

  /**
   *
   * Command directory path
   * Bot commands should be located here
   * @type {string}
   * @memberof Client
   */
  public readonly commandDir: string;

  /**
   *
   * Bot configurations including login config
   * should be loaded here
   * @type {string}
   * @memberof Client
   */
  public readonly configPath: string;

  /**
   *
   * Bot command collection
   * @type {CommandStorage<this, string, Command<this>>}
   * @memberof Client
   */
  public readonly commands: CommandStorage<this, string, Command<this>>;

  /**
   *
   * Flag whether to accept friend requests
   * @type {boolean}
   * @memberof Client
   */
  public acceptFriendRequests: boolean;

  /**
   *
   * Rate interval to accept friend requests
   * @type {number}
   * @memberof Client
   */
  public acceptRate: number;

  /**
   *
   * Is Client paused
   * @type {boolean}
   * @memberof Client
   */
  public pause: boolean;

  public readonly rateLimiter: CommandRateLimiter;
  public readonly middleware: Middleware[];
  public readonly defaultPrefix: string;

  @consoleLogger
  private readonly _logger: ConsoleLogger;
  private readonly _commandDispatcher: CommandDispatcher<this>;
  private readonly _commandLoader: CommandLoader<this>;
  private readonly _defaultRooms: number[];
  private _redis: RedisProvider;

  /**
   * Creates an instance of Client.
   *
   * @param {BotOptions} botOptions Bot Options
   * @param {number} [acceptFriendRequestInterval=10000] The rate to accept friend requests in milliseconds
   * @param {boolean} [acceptFriendRequests=false] Flag whether to accept friend requests
   * @param {string} [commandsDir] Directory command modules are located
   * @param {string} [configPath] Path to bot configurations
   * @param {number[]} [defaultRooms] Default rooms to join on startup
   * @param {string} [defaultPrefix] Default bot prefix
   * @param {string} [name] The name of the bot
   * @param {number[]} [ownerIds] Owner user Id numbers
   * @param {string} [version] The current bot version
   *
   * @param {ClientOptions} clientOptions gamejolt.js Client Options
   * @param  {number} [countInterval] Interval to get friend and notification count
   * @param {number} [friendRequestInterval] Interval to fetch friend requests
   *
   * @memberof Client
   */
  public constructor(botOptions: BotOptions, clientOptions?: ClientOptions) {
    super(clientOptions);

    this.name = botOptions.name || 'bot';
    this.acceptFriendRequests = botOptions.acceptFriendRequests || false;
    this.acceptRate = botOptions.acceptFriendRequestInterval || 10000;
    this.commandDir = botOptions.commandsDir ? path.resolve(botOptions.commandsDir) : null;
    this.configPath = botOptions.configPath ? path.resolve(botOptions.configPath) : null;
    this.version = botOptions.version || '0.0.0';
    this.middleware = [];
    this.defaultPrefix = botOptions.defaultPrefix || '!';
    this.commands = new CommandStorage<this, string, Command<this>>();
    this.pause = botOptions.pause || false;
    this.owners =
      botOptions.ownerIds instanceof Array
        ? botOptions.ownerIds
        : typeof botOptions.ownerIds !== 'undefined'
          ? [botOptions.ownerIds]
          : [];

    this.initConfig();
    this._redis = RedisProvider.instance(nconf.get('redis_port'), nconf.get('redis_host'));
    this._redis.init();

    this._defaultRooms = botOptions.defaultRooms;
    this._commandDispatcher = new CommandDispatcher<this>(this);
    this._commandLoader = new CommandLoader<this>(this);

    if (botOptions.rateLimitInterval)
      this.rateLimiter = new CommandRateLimiter(botOptions.rateLimitInterval, true);

    if (typeof botOptions.logLevel !== 'undefined') this._logger.setLogLevel(botOptions.logLevel);

    this._commandLoader.loadCommands();

    registerListeners(this);
  }

  /**
   *
   * Check if the bot is in quiet mode
   * @param {number} roomId
   * @returns {Promise<boolean>}
   * @memberof Client
   */
  public async isQuiet(roomId: number): Promise<boolean> {
    return (await this._redis.get(`mode::${roomId}`)) === 'quiet';
  }

  /**
   *
   * Check if the bot is in serious mode
   * @param {number} roomId
   * @returns {Promise<boolean>}
   * @memberof Client
   */
  public async isSerious(roomId: number): Promise<boolean> {
    return (await this._redis.get(`mode::${roomId}`)) === 'serious';
  }

  /**
   * Checks if the passed user is an owners
   * of this bot instance
   * @param {User} user
   * @returns {boolean}
   *
   * @memberof Client
   */
  public async isOwner(user: User): Promise<boolean> {
    for (const owner of this.owners) {
      if (user.id === owner) return true;
    }
    return false;
  }

  /**
   *
   * Start the bot instance
   * @returns {this}
   *
   * @memberof Client
   */
  public start(): this {
    const config = require(this.configPath);

    if (!config.username || !config.password || !config)
      throw new Error('No username or password has been provided.');

    this.login(config.username, config.password);
    return this;
  }

  /**
   *
   * Get room prefix
   * @param {number} roomId
   * @returns {Promise<string>}
   * @memberof Client
   */
  public async getPrefix(roomId: number): Promise<string> {
    return (await this._redis.get(`prefix::${roomId}`)) || this.defaultPrefix;
  }

  /**
   *
   * Get the current room mode
   * @param {number} roomId
   * @returns {promise<string>}
   * @memberof Client
   */
  public async getCurrentMode(roomId: number): Promise<string> {
    let exists = await this._redis.keyExists(`mode::${roomId}`);

    if (exists[0] === 1) return await this._redis.get(`mode::${roomId}`);
    else return 'serious';
  }

  /**
   *
   * Enter default chat rooms when bot loads
   * @private
   * @param {number[]} rooms
   * @returns {Promise<void>}
   *
   * @memberof Client
   */
  private async _enterDefaultRooms(): Promise<void> {
    for (let room of this._defaultRooms) {
      if (room) await this.chat.enterRoom(room);
    }
  }

  @once('connected')
  private async _onConnectedEvent(user: User): Promise<void> {
    if (this._defaultRooms.length > 0) {
      await this._enterDefaultRooms();
    }

    if (this.pause) this.emit('pause');
    else this._onContinueEvent();
  }

  @once('continue')
  private async _onContinueEvent(): Promise<void> {
    this._commandDispatcher.setReady();

    this.emit('client-ready');
  }

  /**
   * Reload a command or pass 'all' to reload all commands
   * @param {string} command The command to reload.
   *
   * @memberof Client
   */
  public reloadCommand(command: string): void {
    if (!command)
      throw new Error(`A command name must be provided. Or pass 'all' to reload all commands`);

    if (command === 'all') this._commandLoader.loadCommands();
    else this._commandLoader.reloadCommand(command);
  }

  /**
   *
   * Add middleware function to client
   * @param {Middleware} func
   * @returns {this}
   * @memberof Client
   */
  public use(func: Middleware): this {
    this.middleware.push(func);
    return this;
  }

  private initConfig(): void {
    const configPath = path.join(this.configPath);

    nconf.use('memory');
    nconf.argv().env();

    if (fs.existsSync(this.configPath)) {
      nconf.defaults(require(configPath));
    }
  }

  /**
   * Checks if the user is blacklisted
   * @param {User} user
   * @param {number} [roomId]
   * @returns {Promise<boolean>}
   * @memberof Client
   */
  public async isBlacklisted(user: User, roomId?: number): Promise<boolean> {
    if (roomId) {
      let roomitems: any = await this._redis.listRange(`blacklist::${roomId}`, 0, -1);
      roomitems = roomitems[0];

      for (let item of roomitems.entries()) {
        let id: string = item[1];

        if (id === user.id.toString()) return true;
      }
    }

    let globalitems: any = await this._redis.listRange(`blacklist::global`, 0, -1);
    globalitems = globalitems[0];

    for (let item of globalitems.entries()) {
      let id: string = item[1];

      if (id === user.id.toString()) return true;
    }
    return false;
  }

  //#region Gamejolt.js events

  public on(event: 'clear-notifications', listener: (data: any) => void): this;
  public on(event: 'connected', listener: (user: User) => void): this;
  public on(event: 'message', listener: (message: Message) => void): this;
  public on(event: 'message-cleared', listener: (data: any) => void): this;
  public on(event: 'friend-offline', listener: (userId: number, friend: User) => void): this;
  public on(event: 'friend-online', listener: (friend: User) => void): this;
  public on(event: 'friend-add', listener: (friend: User) => void): this;
  public on(event: 'friend-remove', listener: (userId: number, removed?: User) => void): this;
  public on(event: 'online-count', listener: (count: number) => void): this;
  public on(event: 'friends-list', listener: (friends: UserCollection) => void): this;
  public on(event: 'user-enter-room', listener: (roomId: number, user: User) => void): this;
  public on(
    event: 'user-leave-room',
    listener: (userId: number, roomId: number, user?: User) => void
  ): this;
  public on(event: 'friend-updated', listener: (oldUser: User, user: User) => void): this;
  public on(event: 'role-set', listener: (data: any) => void): this;
  public on(
    event: 'user-muted',
    listener: (userId: number, roomId: number, isGlobal: boolean, user?: User) => void
  ): this;
  public on(
    event: 'user-unmuted',
    listener: (userId: number, roomId: number, isGlobal: boolean, user?: User) => void
  ): this;
  public on(event: 'user-updated', listener: (oldUser: User, user: User) => void): this;
  public on(event: 'notification', listener: (data: Message | object) => void): this;
  public on(event: 'prime-chatroom', listener: (data: any) => void): this;
  public on(event: 'public-rooms', listener: (rooms: Room[]) => void): this;
  public on(event: 'you-updated', listener: (oldUser: User, user: User) => void): this;
  public on(event: 'you-leave-room', listener: (data: any) => void): this;

  //#endregion

  public on(event: 'continue', listener: () => void);
  public on(event: 'pause', listener: () => void);
  public on(event: 'client-ready', listener: () => void): this;
  public on(
    event: 'command',
    listener: (name: string, args: any[], message: Message) => void
  ): this;

  /**
   *
   * Emitted when the client is ready
   * @event event:client-ready
   * @memberof Client
   */

  /**
   *
   * Emitted when a bot command is dipatched
   * @event event:command
   * @memberof Client
   */

  /**
   *
   * Emitted when bot is paused
   * @event event:puase
   * @memberof Client
   */

  /**
   *
   * Emitted when bot is unpaused
   * @event event:continue
   * @memberof Client
   */

  public on(event: string, listener: Function): this {
    return super.on(event, listener);
  }
}
