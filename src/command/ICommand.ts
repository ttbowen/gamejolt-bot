import { Client } from '../core/client/Client';
import { CommandRateLimiter } from './CommandRateLimiter';
import { CommandTypes } from '../types/CommandTypes';
import { Permissions } from '../types/Permissions';
import { Message, User } from 'gamejolt.js';

/**
 * 
 * Provides a common interface for all command types
 * @export
 * @interface ICommand
 * @template T
 */
export interface ICommand<T extends Client> {
    client: T;
    name: string;
    description: string;
    usage: string;
    type: CommandTypes;
    aliases: string[];
    argSeparator: string
    permissionLevels: Permissions[];
    ownerOnly: boolean;  
    pmOnly: boolean;
    rateLimiter: CommandRateLimiter;
    invoke(message: Message, args?: any[]): void;
    register(client: T): void;
}