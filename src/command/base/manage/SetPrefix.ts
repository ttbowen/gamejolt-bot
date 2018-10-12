import { Message } from 'gamejolt.js';

import { Command } from '../../Command';

export default class extends Command {
  public constructor() {
    super({
      name: 'setprefix',
      description: 'Set the bot command prefix.',
      usage: '<prefix> setprefix [prefix]',
      aliases: ['sp'],
      type: 'manage',
      ownerOnly: true,
      ignoreCooldown: true
    });
  }

  public async invoke(message: Message, [prefix]: [string]): Promise<void> {
    if (!prefix) {
      return message.reply('Please provide a new prefix.');
    }

    if (prefix.length > 8) {
      message.reply('Prefix must be smaller than 8 characters.');
    }

    this._redis.set(`prefix::${message.roomId}`, prefix);
    return message.reply(`Prefix successfully set.`);
  }
}
