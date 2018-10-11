import { Message } from 'gamejolt.js';
import { Command } from '../../Command';
import { Permissions } from '../../../types/Permissions';

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
    let version: string = this.client.version;
    message.reply(`My current version is at: \`${version}\``);
  }
}
