import { Client } from '../core/client/Client';
import { Command } from './Command';
import { CommandRateLimit } from './CommandRateLimit';
import { CommandRateLimiter } from './CommandRateLimiter';
import { Permissions } from '../types/Permissions';
import { Middleware } from '../types/Middleware';
import { TimeUtil } from '../util/TimeUtil';
import { RedisProvider } from '../storage/database/RedisProvider';

import { Message, User } from 'gamejolt.js';


/**
 * 
 * Dispatches and invokes bot commands 
 * @export
 * @class CommandDispatcher
 * @template T
 */
export class CommandDispatcher<T extends Client> {
    public constructor(client: T) {
        this._client = client;
        this._ready = false;
        this._redis = RedisProvider.instance();
        this._client.on('message', message => this.handleMessage(message));
    }

    private _client: T;
    private _ready: boolean;
    private _redis: RedisProvider;



    /**
     * 
     * Sets the status of the dispatcher to ready
     * @memberof CommandDispatcher
     */
    public setReady(): void {
        this._ready = true;
    }

    /**
     * 
     * Handle message event 
     * @private
     * @param {Message} message
     * @returns {Promise<void>}
     * 
     * @memberof CommandDispatcher
     */
    private async handleMessage(message: Message): Promise<void> {
        if (!this._ready) return;
    
        if (message.user.id === this._client.clientUser.id) return;
        
        const owner = await this._client.isOwner(message.user);
        const [commandCalled, command, prefix, name]: [boolean, Command<T>, string, string] = await this.isCommandCalled(message);

        const pm: boolean = message.room.type === 'pm';

        if (!commandCalled) {
            return;
        }

        if (command.pmOnly && !pm && !owner) return message.reply('This is a pm only command.');

        if (await this._client.isQuiet(message.roomId) && 
            command.type !== 'moderation' && command.type !== 'manage') return;
    
        if (await this._client.isSerious(message.roomId) && command.type === 'fun') return;

        let hasPermission = this.checkPermissions(command, message);
        if (!hasPermission) return;

        let args: string[] = message.contentRaw
            .replace(prefix, '').replace(name, '')
            .trim()
            .split(command.argSeparator)
            .map(a => a.trim())
            .filter(a => a !== '')

        if (command.ownerOnly && !owner) return;

        if (!command.ignoreCooldown) {
            if (!this._checkRateLimits(message, command)) return;
        }

        if (await this.isBlacklisted(message.user, message)) return;

        let middlewarePassed: boolean = true;
        let middleware: Middleware[] = this._client.middleware.concat(command.middleware);

        for (let m of middleware) {
            try {
                let result: Promise<[Message, any[]]> | [Message, any[]] =
                    m.call(command, message, args);
                if (result instanceof Promise) result = await result;

                if (!(result instanceof Array)) {
                    middlewarePassed = false;
                    break;
                }
                [message, args] = result;
            } catch (ex) {
                middlewarePassed = false;
                break;
            }
        }
        if (middlewarePassed)
            await this.dispatch(command, message, args).catch(console.error);

        this._client.emit('command', command.name, args, message);
    }


    /**
     * 
     * Check if command has been called by a user
     * @private
     * @param {Message} message
     * @returns {Promise<[boolean, Command<T>, string, string]>}
     * 
     * @memberof CommandDispatcher
     */
    private async isCommandCalled(message: Message): Promise<[boolean, Command<T>, string, string]> {
        const prefixes: string[] = [`!`];
        const pm: boolean = message.room.type === 'pm';

        if (await this._client.getPrefix(message.roomId)) {
            prefixes.push(await this._client.getPrefix(message.roomId));
        }

        let prefix: string = prefixes.find(a => message.contentRaw.trim().startsWith(a));

        if (typeof prefix === 'undefined' && message.isMentioned) prefix = message.contentRaw.split(' ')[0];
        if (pm && typeof prefix === 'undefined') prefix = '';
        if (typeof prefix === 'undefined' && !pm) return [false, null, null, null];

        const commandName: string = message.contentRaw.trim()
            .slice(prefix.length).trim()
            .split(' ')[0];

        const command: Command<T> = this._client.commands.find(c =>
            c.name.toLowerCase() === commandName.toLowerCase()
            || c.aliases.map(a => a.toLowerCase()).includes(commandName));


        if (!command) return [false, null, null, null];
        return [true, command, prefix, commandName];
    }

    private _checkRateLimits(message: Message, command?: Command<T>): boolean {
        let passedGlobal: boolean = true;
        let passedCommand: boolean = true;
        let passedRateLimiters: boolean = true;

        if (!this._checkRateLimiter(message)) passedGlobal = false;
        if (!this._checkRateLimiter(message, command)) passedCommand = false;
        if (!passedGlobal || !passedCommand) passedRateLimiters = false;

        if (passedRateLimiters) {
            if (!(command && command.rateLimiter && !command.rateLimiter.get(message).call()) && this._client.rateLimiter)
                this._client.rateLimiter.get(message).call();
        }
        return passedRateLimiters;
    }

    private _checkRateLimiter(message: Message, command?: Command<T>): boolean {

        const rateLimiter: CommandRateLimiter = command ? command.rateLimiter : this._client.rateLimiter;

        if (!rateLimiter) return true;

        const rateLimit: CommandRateLimit = rateLimiter.get(message);
        if (!rateLimit.isRateLimited) return true;

        if (!rateLimit.wasNotified) {
            const globalLimiter: CommandRateLimiter = this._client.rateLimiter;
            const globalLimit: CommandRateLimit = globalLimiter ? globalLimiter.get(message) : null;

            if (globalLimit && globalLimit.isRateLimited && globalLimit.wasNotified) return;
            rateLimit.setNotified();
            if (!command)
                message.reply(`Global cooldown. Try again in ${TimeUtil.difference(rateLimit.expires, Date.now()).toString()}`);
            else
                message.reply(`Command cooldown. Try again in ${TimeUtil.difference(rateLimit.expires, Date.now()).toString()}`);
        }
        return false;
    }

    private checkCallerPermissions(command: Command<T>, message: Message): Permissions[] {
        let permissions: Permissions[] = [];

        if (message.user.permissionLevel === 0) permissions.push(Permissions.USER);

        if (message.user.permissionLevel > 1)
            permissions.push(Permissions.SITE_MODERATOR)

        for (let user in message.room.staff) {
            if (message.room.staff[user].userId === message.user.id) {
                permissions.push(Permissions.ROOM_MODERATOR);
                break;
            }
        }
        return permissions;
    }

    private async isBlacklisted(user: User, message: Message): Promise<boolean> {
        let roomitems: any = await this._redis.listRange(`blacklist::${message.roomId}`, 0, -1);

        for (let item of roomitems[0].entries()) {
            let id: string = user.id.toString();
            if (item[1] === id) return true;
        }

        let globalitems: any = await this._redis.listRange(`blacklist::global`, 0, -1);

        for (let item of globalitems[0].entries()) {
            let id: string = user.id.toString();
            if (item[1] === id) return true;
        }
        return false
    }

    /**
     * 
     * Check command caller permissions
     * @private
     * @param {Command<T>} command 
     * @param {Message} message 
     * @returns {Promise<boolean>} 
     * 
     * @memberof CommandDispatcher
     */
    private checkPermissions(command: Command<T>, message: Message): boolean {
        let permissions: Permissions[] = this.checkCallerPermissions(command, message);

        for (let p of permissions) {
            for (let c of command.permissionLevels) {
                if (p >= c)
                    return true;
            }
        }
        return false;
    }

    /**
     * 
     * Invoke the command action
     * @private
     * @param {Command<T>} command
     * @param {Message} message
     * @param {any[]} args
     * @returns {Promise<any>}
     * 
     * @memberof CommandDispatcher
     */
    private async dispatch(command: Command<T>, message: Message, args: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                const action: any = command.invoke(message, args);
                if (action instanceof Promise) {
                    action.then(resolve).catch(reject);
                } else resolve(action);
            } catch (err) { reject(err); }
        });
    }
}