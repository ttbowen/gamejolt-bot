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

import { Message, User } from 'gamejolt.js';

/**
 *
 * Represents a generic bot command
 * @export
 * @abstract
 * @class Command
 * @implements {ICommand<T>}
 * @template T
 * @template Client
 */
export abstract class Command<T extends Client = Client> implements ICommand<T> {
  public client: T;

  /**
   *
   * The name of the command
   * @type {string}
   * @memberof Command
   */
  public name: string;

  /**
   *
   * Information about the command
   * @type {string}
   * @memberof Command
   */
  public description: string;

  /**
   *
   * Command Usage help
   * @type {string}
   * @memberof Command
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
   *
   * Type of command
   * @type {CommandTypes}
   * @memberof Command
   */
  public type: CommandTypes;

  /**
   *
   * Aliases for command name
   * @type {string[]}
   * @memberof Command
   */
  public aliases: string[];

  /**
   *
   * Character to separate command arguments
   * @type {string}
   * @memberof Command
   */
  public argSeparator: string;

  /**
   *
   * The command permission Level
   * @type {Permissions}
   * @readonly
   * @memberof Command
   */
  public readonly permissionLevels: Permissions[];

  /**
   *
   * Bot owner command
   * @type {boolean}
   * @readonly
   * @memberof Command
   */
  public readonly ownerOnly: boolean;

  /**
   *
   * Rate limiting instance
   * @type {CommandRateLimiter}
   * @readonly
   * @memberof Command
   */
  public readonly rateLimiter: CommandRateLimiter;

  /**
   *
   * Specifies the command location
   * @type {string}
   * @memberof Command
   */
  public commandLoc: string;

  /**
   *
   * Collection of command middleware
   * @type {Middleware[]}
   * @memberof Command
   */
  public middleware: Middleware[];

  /**
   *
   * Specifies if the command can only
   * be used in Private chats
   * @type {boolean}
   * @memberof Command
   */
  public pmOnly: boolean;

  /**
   *
   * Specifies whether the cooldown should be ignored
   * for this command
   * @type {boolean}
   * @memberof Command
   */
  public ignoreCooldown: boolean;

  protected _redis: RedisProvider;

  /**
   * Creates an instance of Client.
   *
   * @param {CommandOptions} info Command options and settings
   * @param {string} [name] The name of the command
   * @param {string} [description] Information about the command
   * @param {CommandTypes} [type] Type of command
   * @param {number} [permissionLevel] Permission Level users must have to use this command
   * @param {string} [usage] How to use the command
   * @param {string} [argSeparator] Character delimiter that separates command arguments
   * @param {string[]} [ownerIds] Aliases for command name
   * @param {boolean} [ownerOnly] Flag if this an owner only command
   *
   * @memberof Command
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
   *
   * Invoke the command action
   * @abstract
   * @param {Message} message
   * @param {any[]} [args]
   *
   * @memberof Command
   */
  public abstract invoke(message: Message, args?: any[]): void;

  /**
   *
   * Register new command
   * @param {T} client
   *
   * @memberof Command
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
   *
   * Add middleware handler to command
   * @param {Middleware} func
   * @returns {this}
   * @memberof Client
   */
  public use(func: Middleware): this {
    this.middleware.push(func);
    return this;
  }
}
