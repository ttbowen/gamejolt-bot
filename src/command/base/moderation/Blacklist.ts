import { Message, SiteUser, User } from 'gamejolt.js';
import { Command } from '../../Command';
import { resolve } from '../../middleware/Resolve';
import { expect } from '../../middleware/Expect';
import { using } from '../../CommandDecorators';
import { Permissions } from '../../../types/Permissions';

export default class extends Command {
    public constructor() {
        super({
            name: 'blacklist',
            description: 'Add a user to the blacklist.',
            usage: '<prefix> blacklist [username]',
            aliases: ['bl', 'ignore'],
            type: 'moderation',
            permissionLevels: [Permissions.ROOM_MODERATOR],
            ignoreCooldown: true
        });
    }

    @using(resolve({ '<user>': 'SiteUser' }))
    public async invoke(message: Message, [user, global]: [SiteUser, string]): Promise<void> {

        if (!user) {
            let users: string = '\n';
            let blacklisted = await this._redis.listRange(`blacklist::${message.room.id}`, 0, -1);
            blacklisted = blacklisted[0];

            for (let id of blacklisted) {
                let user: SiteUser = await this.client.api.getUser(parseInt(id));
                users += user.username;
                users += '\n';
            }
            return message.reply(users);
        }

        // Make sure the bot cant ignore itself or caller
        if (message.user.id === user.id) return message.reply('You cannot blacklist yourself.');
        if (this.client.clientUser.id === user.id) return message.reply('You cannot blacklist me.');

        let usr: User = new User(null, { id: user.id });
        if (await this.client.isOwner(usr)) return message.reply('You cannot ignore bot owners.');

        // Check for global blacklist
        if (global === 'global') {
            global = global.toLowerCase();

            if (!this.client.isOwner(message.user)) {
                return message.reply('Only owners can globally blacklist users.');
            } else {
                this._redis.lpush(`blacklist::global`, user.id);

                return message.reply(`Globally blacklisted **${user.displayName}**.`);
            }
        } else {

            this._redis.lpush(`blacklist::${message.roomId}`, user.id);

            return message.reply(`**${user.displayName}** has been blacklisted.`);
        }
    }
}