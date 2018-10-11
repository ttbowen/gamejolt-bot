import { Message, User, SiteUser, Room, PublicRooms } from 'gamejolt.js';

import { Command } from '../Command';
import { Client } from '../../core/client/Client';
import { Middleware } from '../../types/Middleware';
import { RoomNames } from '../../types/RoomNames';

export type ResolveArgTypeNames = 'User' | 'Room' | 'String' | 'Number' | 'Any' | 'SiteUser';

/**
 *
 * Resolve various types passed to middleware function
 * @export
 * @template T
 * @param {{ [name: string]: ArgTypeNames }} argTypes
 * @returns
 */
export function resolve<T extends Command>(argTypes: {
  [name: string]: ResolveArgTypeNames;
}): Middleware {
  return async function(this: T, message: Message, args: any[]): Promise<[Message, any[]]> {
    const names: string[] = Object.keys(argTypes);
    const types: ResolveArgTypeNames[] = names.map(a => argTypes[a]);

    for (const [index, name] of names.entries()) {
      const arg: any = args[index];
      const type: ResolveArgTypeNames = types[index];

      if (type === 'Any') continue;

      if (type === 'SiteUser') {
        let user: SiteUser;

        try {
          let cmd: T = this;
          if (arg) user = await cmd.client.api.getUser(arg);
          else user = null;
        } catch (ex) {
          console.log(ex);
        }

        args[index] = user;
      } else if (type === 'Room') {
        let cmd: T = this;
        let roomName: string = arg.toLowerCase();

        if (PublicRooms[roomName]) {
          let roomId: number = PublicRooms[roomName];

          if (roomId) {
            for (let room of cmd.client.chat.publicRooms) {
              if (roomId === room.id) {
                args[index] = room;
                break;
              }
            }
          }
        }
      } else if (type === 'String') {
        args[index] = arg.toString();
      } else if (type === 'Number') {
        if (!isNaN(args[index])) throw new Error(`${args[index]} is not of type 'Number'`);

        args[index] = parseFloat(arg);
      }
    }
    return [message, args];
  };
}
