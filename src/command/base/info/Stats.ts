import { Message } from 'gamejolt.js';

import { Command } from '../../Command';

export default class extends Command {
  public constructor() {
    super({
      name: 'stats',
      description: 'Get chat, site and bot stats.',
      usage: '<prefix> stats <online>',
      extraHelp: [
        {
          commandName: 'online',
          description: 'Get the number of users online.',
          args: '<prefix> stats online'
        }
      ],
      type: 'info'
    });
  }

  public async invoke(message: Message, [command]: [string]): Promise<void> {
    if (!command) {
      return message.reply('Please enter a command. Use `help stats` for more help');
    }

    command = command.toLowerCase();

    if (command === 'online') {
      return message.reply(`There are currently **${this.client.chat.userCount}** user's online.`);
    }
  }
}
