import { Message } from 'gamejolt.js';
import { Command } from '../../Command';
import { Time } from '../../../types/Time';
import { TimeUtil } from '../../../util/TimeUtil';
import { Permissions } from '../../../types/Permissions';

export default class extends Command {
    public constructor() {
        super({
            name: 'uptime',
            description: 'Get the time the bot has been up without downtime.',
            usage: '<prefix> uptime',
            aliases: [ 'ut' ],
            type: 'info',
        });
    }

    public async invoke(message: Message): Promise<void> {
        let uptime: Time;

        uptime = TimeUtil.convertMs(this.client.chat.uptime);

        return message.reply(`I have been up ${ uptime.toString() }`);
    }
}