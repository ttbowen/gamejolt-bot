import { Message } from 'gamejolt.js';

import { Command } from '../../Command';

export default class extends Command {
  public constructor() {
    super({
      name: 'ping',
      description: 'Sends back a pong response.',
      usage: '<prefix> ping',
      type: 'info'
    });
  }

  public async invoke(message: Message): Promise<void> {
    const start = process.hrtime();
    const end = process.hrtime(start);

    return message.reply(`Pong! Execution time ${end[0]}s ${end[1] / 1000000}ms`);
  }
}
