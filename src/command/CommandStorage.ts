import { Client } from '../core/client/Client';
import { Command } from './Command';
import { Collection } from '../util/Collection';

/**
 *
 * Stores loaded commands in a collection
 * @export
 * @class CommandStorage
 * @extends {Collection<K, V>}
 * @template T
 * @template K
 * @template V
 */
export class CommandStorage<
  T extends Client,
  K extends string,
  V extends Command
> extends Collection<K, V> {
  public constructor() {
    super();
  }

  /**
   *
   * Add a new loaded command to the collection
   * @param {T} client
   * @param {V} command
   * @param {K} key
   * @param {boolean} reload
   * @returns {void}
   *
   * @memberof CommandStorage
   */
  public register(client: T, command: V, key: K, reload?: boolean): void {
    // Check if this command is already registered
    if (super.has(<K>command.name) && !reload) return;

    for (const cmd of this.values()) {
      for (const alias of cmd.aliases) {
        let duplicates: Collection<K, V> = this.filter(c => c.aliases.includes(alias) && c !== cmd);
        if (duplicates.size > 0) throw new Error(`Command may may not share aliases`);
      }
    }
    command.register(client);
    super.set(key, <V>command);
  }

  /**
   *
   * Finds a command by name or alias
   * @param {string} text The command name or alias
   * @returns {V}
   *
   * @memberof CommandStorage
   */
  public findByNameOrAlias(text: string): V {
    return this.filter(c => c.name === text || c.aliases.includes(text)).first();
  }

  /**
   *
   * Finds commands by type
   * and returns a collection of found commands
   * @param {string} text The command type
   * @returns {V}
   *
   * @memberof CommandStorage
   */
  public findByType(text: string): Collection<K, V> {
    return this.filter(c => c.type === text);
  }
}
