import { Message, User, Room } from 'gamejolt.js';

import { Command } from '../Command';
import { Middleware } from '../../types/Middleware';

export type ArgTypeNames = 'User' | 'Room' | 'String' | 'Number' | 'Any' | 'SiteUser' | string[];

/**
 *
 *
 * @export
 * @template T
 * @param {{ [name: string]: ArgTypeNames }} argTypes
 * @returns
 */
export function expect<T extends Command>(argTypes: { [name: string]: ArgTypeNames }): Middleware {
  return async function(this: T, message: Message, args: any[]): Promise<[Message, any[]]> {
    const names: string[] = Object.keys(argTypes);
    const types: ArgTypeNames[] = names.map(a => argTypes[a]);

    for (const [index, name] of names.entries()) {
      const arg: any = args[index];
      const type: ArgTypeNames = types[index];

      if (type === 'Any') continue;

      if (type === 'SiteUser') {
        if (!(arg instanceof User)) {
          throw new Error(`Expected type 'User' for argument: ${name}`);
        }
      } else if (type === 'Room') {
        if (!(arg instanceof Room)) {
          throw new Error(`Expected type 'Room' for argument: ${name}`);
        }
      } else if (type === 'String') {
        if (typeof arg !== 'string') {
          throw new Error(`Expected type 'String' for argument: ${name}`);
        }
      } else if (type === 'Number') {
        if (!isNaN(arg) && !isFinite(arg)) {
          throw new Error(`Expected type 'Number' for argument: ${name}`);
        }
      } else if (type instanceof Array) {
        if (!type.map(a => a.toLowerCase()).includes(arg.toLowerCase())) {
          let t = type.map(t => t).join(', ');
          throw new Error(`Expected type ${t} for argument: ${name}`);
        }
      }
    }
    return [message, args];
  };
}
