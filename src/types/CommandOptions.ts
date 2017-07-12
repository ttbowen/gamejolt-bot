import { CommandTypes } from './CommandTypes';
import { Permissions } from './Permissions';

/**
 * Options that are provided to a Command
 * 
 * @typedef {object} CommandOptions
 * @property {string} [name] The name of the command
 * @property {string} [description] Description of the command
 * @property {string} [usage] Usage instructions for command
 * @property {number} [permissionLevel] Command permission level
 * @property {CommandTypes} [type] The command type
 * @property {string} [extraHelp] Extra command help
 * @property {boolean} [ownerOnly] Owner only command
 * @property {boolean} [pmOnly] Private message command only
 * @property {string[]} [aliases]  Alternative names for command
 * @property {string} [argSeparator] Character to separate args by
 */
export type CommandOptions =  {
    name: string;
    description: string;
    usage: string;
    permissionLevels?: Permissions[];
    type: CommandTypes;
    extraHelp?: string;
    ownerOnly?: boolean;
    pmOnly?: boolean;
    aliases?: string[];
    argSeparator?: string;
    rateLimit?: [number, number];
}