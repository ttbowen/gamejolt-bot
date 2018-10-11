import { User, Message } from 'gamejolt.js';

import { Collection } from '../util/Collection';
import { CommandRateLimit } from './CommandRateLimit';

/**
 *
 * Handle ratelimiter objects for chatrooms
 * @export
 * @class CommandRateLimiter
 */
export class CommandRateLimiter {
  private readonly _rateLimits: Collection<number, Collection<number, CommandRateLimit>>;
  private readonly _globalLimits: Collection<number, CommandRateLimit>;
  private _global: boolean;
  private _limit: [number, number];

  /**
   * Creates an instance of CommandRateLimiter.
   *
   * @param {number} limit
   * @param {boolean} global
   *
   * @memberof CommandRateLimiter
   */
  public constructor(limit: [number, number], global: boolean) {
    this._global = global;
    this._limit = limit;
    this._rateLimits = new Collection<number, Collection<number, CommandRateLimit>>();
    this._globalLimits = new Collection<number, CommandRateLimit>();
  }

  /**
   *
   * Get rate limit collections
   * @param {Message} message
   * @param {User} [userOverride]
   * @returns {CommandRateLimit}
   *
   * @memberof CommandRateLimiter
   */
  public get(message: Message, userOverride?: User): CommandRateLimit {
    const user: User = userOverride ? userOverride : message.user;

    if (this._isGlobal(message)) {
      if (!this._globalLimits.has(user.id))
        this._globalLimits.set(user.id, new CommandRateLimit(this._limit));

      return this._globalLimits.get(user.id);
    } else {
      if (!this._rateLimits.has(message.room.id)) {
        this._rateLimits.set(message.room.id, new Collection<number, CommandRateLimit>());
      }

      if (!this._rateLimits.get(message.room.id).has(user.id)) {
        this._rateLimits.get(message.room.id).set(user.id, new CommandRateLimit(this._limit));
      }
      return this._rateLimits.get(message.room.id).get(user.id);
    }
  }

  private _isGlobal(message?: Message): boolean {
    return message ? message.room.type === 'pm' || this._global : this._global;
  }
}
