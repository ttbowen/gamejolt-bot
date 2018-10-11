import { Client } from '../core/client/Client';
import { Command } from './Command';
import { Collection } from '../util/Collection';

/**
 * Stores loaded commands in a collection.
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
   * Add a new loaded command to the collection.
   * @param client The bot client.
   * @param command The command object to register.
   * @param key The key to register command under.
   * @param reload Whether to reload command.
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
   * Finds a command by name or alias.
   * @param text The command name or alias.
   */
  public findByNameOrAlias(text: string): V {
    return this.filter(c => c.name === text || c.aliases.includes(text)).first();
  }

  /**
   * Finds commands by type and returns a collection of found commands.
   * @param text The command type.
   */
  public findByType(text: string): Collection<K, V> {
    return this.filter(c => c.type === text);
  }
}
