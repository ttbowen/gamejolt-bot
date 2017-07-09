import { Message, PublicRooms } from 'gamejolt.js';
import { Command } from '../../Command';
import { Permissions } from '../../../types/Permissions';

export default class extends Command {
    public constructor() {
        super({
            name: 'leaveroom',
            description: 'Leave a chat room.',
            usage: '<prefix> leaveroom',
            type: 'manage',
            aliases: [ 'leave', 'gtfo' ],
            permissionLevels: [ Permissions.ROOM_MODERATOR ]
        });
    }

    public async invoke(message: Message): Promise<void> {
        
        const pm: boolean = message.room.type === 'pm';

        if (pm) message.reply('Cannot leave a Private Message room.');

        message.reply('Okay Bye Bye.');
        this.client.chat.leaveRoom(message.roomId);
    }
}