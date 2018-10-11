import { Message, User } from 'gamejolt.js';
import * as nconf from 'nconf';

import { Client } from '../core/client/Client';
import { CommandOptions } from '../types/CommandOptions';
import { CommandRateLimiter } from './CommandRateLimiter';
import { CommandTypes } from '../types/CommandTypes';
import { Permissions } from '../types/Permissions';
import { ICommand } from './ICommand';
import { Middleware } from '../types/Middleware';
import { RedisProvider } from '../storage/database/RedisProvider';
import { ExtraHelp } from '../types/ExtraHelp';

/**
 * Represents a generic bot command.
 */
export abstract class Command<T extends Client = Client> implements ICommand<T> {
  /**
   * Reference to the bot client.
   */
  public client: T;

  /**
   * The name of the command.
   */
  public name: string;

  /**
   * Information about the command.
   */
  public description: string;

  /**
   * Command Usage help.
   */
  public usage: string;

  /**
   *
   * Extra command help for sub commands
   * @type {ExtraHelp[]}
   * @memberof Command
   */
  public extraHelp: ExtraHelp[];

  /**
   * Type of command.
   */
  public type: CommandTypes;

  /**
   * Alternative names for the command.
   */
  public aliases: string[];

  /**
   * Character to separate command arguments.
   */
  public argSeparator: string;

  /**
   * The command permission Levels.
   * Only the permissions contained here will run this command.
   */
  public readonly permissionLevels: Permissions[];

  /**
   * Whether this is an owner only command.
   */
  public readonly ownerOnly: boolean;

  /**
   * Rate limiting instance.
   */
  public readonly rateLimiter: CommandRateLimiter;

  /**
   * Specifies the command location.
   */
  public commandLoc: string;

  /**
   * Collection of command middleware.
   */
  public middleware: Middleware[];

  /**
   * Specifies if the command can only
   * be used in Private chats.
   */
  public pmOnly: boolean;

  /**
   * Specifies whether the cooldown should be ignored
   * for this command.
   */
  public ignoreCooldown: boolean;

  protected _redis: RedisProvider;

  /**
   * Creates an instance of Client.
   * @param info Command options and settings.
   * @param [name] The name of the command
   * @param [description] Information about the command
   * @param [type] Type of command
   * @param [permissionLevel] Permission Level users must have to use this command
   * @param [usage] How to use the command
   * @param [argSeparator] Character delimiter that separates command arguments
   * @param [ownerIds] Aliases for command name
   * @param [ownerOnly] Flag if this an owner only command
   */
  public constructor(info: CommandOptions) {
    this.name = info.name;
    this.description = info.description;
    this.type = info.type;
    this.permissionLevels = info.permissionLevels || [Permissions.USER];
    this.usage = info.usage;
    this.extraHelp = info.extraHelp || [];
    this.argSeparator = info.argSeparator || ',';
    this.aliases = info.aliases || [];
    this.ownerOnly = info.ownerOnly || false;
    this.pmOnly = false || info.pmOnly;
    this.ignoreCooldown = false || info.ignoreCooldown;
    this.middleware = [];
    this.client = null;
    this._redis = RedisProvider.instance();

    if (info.rateLimit) this.rateLimiter = new CommandRateLimiter(info.rateLimit, false);
  }

  /**
   * Invoke the command action.
   * @param message The message object invoking the command.
   * @param [args] Command arguments.
   */
  public abstract invoke(message: Message, args?: any[]): void;

  /**
   * Register a new command.
   * @param client The bot client.
   */
  public register(client: T): void {
    this.client = client;

    if (typeof this.aliases === 'undefined') this.aliases = [];

    if (!this.name) throw new Error(`Command must have a name`);
    if (!this.description) throw new Error(`A description is required for command ${this.name}`);
    if (!this.type) throw new Error(`Command ${this.name} must have a type`);
    if (!this.usage) throw new Error(`Command ${this.name} must have a usage`);
    if (this.aliases && !Array.isArray(this.aliases))
      throw new TypeError(`Aliases for command ${this.name} must be an array`);

    if (!this.invoke) throw new TypeError(`Command ${this.name}.action expected Function.`);
  }

  /**
   * Add middleware handler to command.
   * @param func The middleware function.
   */
  public use(func: Middleware): this {
    this.middleware.push(func);
    return this;
  }
}
