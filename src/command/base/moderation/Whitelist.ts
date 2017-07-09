import { Message, User } from 'gamejolt.js';
import { Command } from '../../Command';
import { resolve } from '../../middleware/Resolve';
import { expect } from '../../middleware/Expect';
import { using } from '../../CommandDecorators';
import { Permissions } from '../../../types/Permissions';

export default class extends Command {
    public constructor() {
        super({
            name: 'whitelist',
            description: 'Remove a user from blacklist.',
            usage: '<prefix> whitelist [username], [global?]',
            aliases: ['wl', 'unignore'],
            type: 'moderation',
            permissionLevels: [Permissions.ROOM_MODERATOR],
        });
    }

    @using(resolve({ '<user>': 'SiteUser' }))
    public async invoke(message: Message, [user, global]: [User, string]): Promise<void> {

        // Check for global blacklist
        if (global === 'global') {
            global = global.toLowerCase();

            if (!this.client.isOwner(message.user)) {
                return message.reply('Only owners can remove global blacklists.');
            } else {
                this._redis.listRemove(`blacklist::global`, 0, user.id);

                return message.reply(`Globally whitelisted **${user.displayName}**.`);
            }
        } else {

            this._redis.listRemove(`blacklist::${message.roomId}`, 0, user.id);

            return message.reply(`**${user.displayName}** has been whitelisted.`);
        }
    }
}