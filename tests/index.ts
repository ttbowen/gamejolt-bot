import { Message, PublicRooms, User } from 'gamejolt.js';

import { Client, ListenerDecorators } from '../dist';

const { on, once } = ListenerDecorators;

class Bot extends Client {
  public constructor() {
    super({
      name: 'mrwhale',
      ownerIds: [15071],
      commandsDir: __dirname + './Commands',
      configPath: __dirname + '/Configs/config.json',
      defaultRooms: [PublicRooms.lobby, PublicRooms.development],
      rateLimitInterval: [3, 1000 * 30]
    });
  }

  @once('client-ready')
  private async _onReady(): Promise<void> {
    console.log(`Client ready. Connected as ${this.clientUser.displayName}`);
  }

  @on('message')
  private async _onMessage(message: Message): Promise<void> {
    this.chat.logMessage(message);
  }

  @on('user-enter-room')
  private async _onUserEnter(roomId: number, user: User): Promise<void> {
    console.log(`${user.displayName} entered`);

    if (user.id === 15071) {
      this.chat.sendMessage(
        `Your ruler and master **${user.displayName}** has entered the chat`,
        roomId
      );
    }
  }

  @on('user-unmuted')
  private async _onUserMuted(
    userId: number,
    roomId: number,
    isGlobal: boolean,
    user: User
  ): Promise<void> {
    if (user) this.chat.sendMessage(`${user.displayName} got unmuted.`, roomId);
  }
}

const mrwhale: Bot = new Bot().start();
