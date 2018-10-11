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
 * The bot client which provides access to chat and api.
 * This extends the gamejolt.js Client functionality.
 */
export class Client extends GameJolt.Client {
  /**
   * The name of the bot.
   */
  public readonly name: string;

  /**
   * The version of the bot.
   */
  public readonly version: string;

  /**
   * Owner Ids for this bot.
   */
  public readonly owners: number[];

  /**
   * Command directory path. Bot commands should be located here
   */
  public readonly commandDir: string;

  /**
   * Bot configurations including login config
   * should be loaded here.
   */
  public readonly configPath: string;

  /**
   * Contains all loaded commands.
   */
  public readonly commands: CommandStorage<this, string, Command<this>>;

  /**
   * Flag whether to accept friend requests.
   */
  public acceptFriendRequests: boolean;

  /**
   * Rate interval to accept friend requests.
   */
  public acceptRate: number;

  /**
   * Flags whether the Client is paused.
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
   * @param botOptions Bot Options.
   * @param [acceptFriendRequestInterval=10000] The rate to accept friend requests in milliseconds.
   * @param [acceptFriendRequests=false] Flag whether to accept friend requests.
   * @param [commandsDir] Directory command modules are located.
   * @param [configPath] Path to bot configurations.
   * @param [defaultRooms] Default rooms to join on startup.
   * @param [defaultPrefix] Default bot prefix.
   * @param [name] The name of the bot.
   * @param [ownerIds] Owner user Id numbers.
   * @param [version] The current bot version.
   * @param clientOptions gamejolt.js Client Options.
   * @param  [countInterval] Interval to get friend and notification count.
   * @param [friendRequestInterval] Interval to fetch friend requests.
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
   * Check if the bot is in serious mode.
   * @param roomId The id of the room to check.
   */
  public async isSerious(roomId: number): Promise<boolean> {
    return (await this._redis.get(`mode::${roomId}`)) === 'serious';
  }

  /**
   * Checks if the passed user is an owner
   * of this bot instance.
   * @param user The user object.
   */
  public async isOwner(user: User): Promise<boolean> {
    for (const owner of this.owners) {
      if (user.id === owner) return true;
    }
    return false;
  }

  /**
   * Start the bot instance.
   */
  public start(): this {
    const config = require(this.configPath);

    if (!config.username || !config.password || !config)
      throw new Error('No username or password has been provided.');

    this.login(config.username, config.password);
    return this;
  }

  /**
   * Get room prefix.
   * @param roomId The id of the room.
   */
  public async getPrefix(roomId: number): Promise<string> {
    return (await this._redis.get(`prefix::${roomId}`)) || this.defaultPrefix;
  }

  /**
   * Get the current room mode.
   * @param roomId The id of the room.
   */
  public async getCurrentMode(roomId: number): Promise<string> {
    let exists = await this._redis.keyExists(`mode::${roomId}`);

    if (exists[0] === 1) return await this._redis.get(`mode::${roomId}`);
    else return 'serious';
  }

  /**
   * Enter default chat rooms when bot loads.
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
   * @param command The command to reload.
   */
  public reloadCommand(command: string): void {
    if (!command)
      throw new Error(`A command name must be provided. Or pass 'all' to reload all commands`);

    if (command === 'all') this._commandLoader.loadCommands();
    else this._commandLoader.reloadCommand(command);
  }

  /**
   * Add middleware function to client.
   * @param func The middleware function to use.
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
   * Checks if the user is blacklisted.
   * @param user The user object.
   * @param [roomId] The id of the room to check blacklist.
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
  public on(event: 'continue', listener: () => void);
  public on(event: 'pause', listener: () => void);
  public on(event: 'client-ready', listener: () => void): this;
  public on(
    event: 'command',
    listener: (name: string, args: any[], message: Message) => void
  ): this;

  /**
   * Setup a new event listener.
   * @param event The event name.
   * @param listener The listener callback when event fires.
   */
  public on(event: string, listener: Function): this {
    return super.on(event, listener);
  }
}
