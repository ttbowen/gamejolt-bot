import { Message, Room } from 'gamejolt.js';

import { Command } from '../../Command';
import { resolve } from '../../middleware/Resolve';
import { using } from '../../CommandDecorators';

export default class extends Command {
  public constructor() {
    super({
      name: 'joinroom',
      description: 'Join a chat room.',
      usage: '<prefix> joinroom [room name|id]',
      type: 'manage',
      aliases: ['join', 'enter'],
      ownerOnly: true,
      ignoreCooldown: true
    });
  }

  @using(resolve({ '<room>': 'Room' }))
  public async invoke(message: Message, [room]: [Room]): Promise<void> {
    if (room instanceof Room) {
      this.client.chat.enterRoom(room.id);
      return message.reply(`Okay joining room **${room.title}** `);
    } else {
      return message.reply(`Could not join this room.`);
    }
  }
}
