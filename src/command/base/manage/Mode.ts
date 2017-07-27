import { Message, PublicRooms } from 'gamejolt.js';
import { Command } from '../../Command';
import { Permissions } from '../../../types/Permissions';
import { Modes } from '../../../types/Modes';

export default class extends Command {
    public constructor() {
        super({
            name: 'mode',
            description: 'Change the bot mode.',
            usage: '<prefix> mode <MODE>',
            type: 'manage',
            permissionLevels: [ Permissions.ROOM_MODERATOR ],
            ignoreCooldown: true
        });
    }

    public async invoke(message: Message, [mode]: [Modes]): Promise<void> {7
        if (!mode) {
            let currentMode: string = await this.client.getCurrentMode(message.roomId);
            return message.reply(`I am currently in \`${currentMode}\` mode`);
        }

        if (!mode.match(/\b(serious|fun|quiet|chatty)\b/)) return message.reply(`Please pass a valid mode`);
        await this._redis.set(`mode::${message.roomId}`, mode);

        if (await this._redis.get(`mode::${message.roomId}`) === mode)
            return message.reply(`Changed room mode to \`${mode}\``);
        else
            return message.reply(`Could not change the room mode`);
    }
}