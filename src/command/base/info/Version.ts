import { Message } from 'gamejolt.js';

import { Command } from '../../Command';

export default class extends Command {
  public constructor() {
    super({
      name: 'version',
      description: 'Get the bot version.',
      usage: '<prefix> version',
      aliases: ['v'],
      type: 'info'
    });
  }

  public async invoke(message: Message): Promise<void> {
    return message.reply(`My current version is at: \`${this.client.version}\``);
  }
}
