import { Message } from 'gamejolt.js';
import { Command } from '../../Command';
import { Permissions } from '../../../types/Permissions';

export default class extends Command {
    public constructor() {
        super({
            name: 'stats',
            description: 'Sends back a pong response.',
            usage: '<prefix> stats [online]',
            type: 'info',
        });
    }

    public async invoke(message: Message, [command]: [string]): Promise<void> {
        command = command.toLowerCase();
        if (command === 'online') {
            return message.reply(`There are currently **${this.client.chat.userCount}** user's online.`);
        }
    }
}