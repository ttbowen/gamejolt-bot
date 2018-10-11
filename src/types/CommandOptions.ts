import { CommandTypes } from './CommandTypes';
import { Permissions } from './Permissions';
import { ExtraHelp } from './ExtraHelp';

/**
 * Options that are provided to a Command.
 */
export type CommandOptions = {
  name: string;
  description: string;
  usage: string;
  permissionLevels?: Permissions[];
  type: CommandTypes;
  extraHelp?: ExtraHelp[];
  ownerOnly?: boolean;
  pmOnly?: boolean;
  aliases?: string[];
  argSeparator?: string;
  rateLimit?: [number, number];
  ignoreCooldown?: boolean;
};
