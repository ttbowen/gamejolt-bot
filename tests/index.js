'use strict';
var __decorate =
  (this && this.__decorate) ||
  function(decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __awaiter =
  (this && this.__awaiter) ||
  function(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : new P(function(resolve) {
              resolve(result.value);
            }).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, '__esModule', { value: true });
const gamejolt_js_1 = require('gamejolt.js');
const dist_1 = require('../dist');
const { on, once } = dist_1.ListenerDecorators;
class Bot extends dist_1.Client {
  constructor() {
    super({
      name: 'mrwhale',
      ownerIds: [15071],
      commandsDir: __dirname + './Commands',
      configPath: __dirname + '/Configs/config.json',
      defaultRooms: [gamejolt_js_1.PublicRooms.lobby, gamejolt_js_1.PublicRooms.development],
      rateLimitInterval: [3, 1000 * 30]
    });
  }
  _onReady() {
    return __awaiter(this, void 0, void 0, function*() {
      console.log(`Client ready. Connected as ${this.clientUser.displayName}`);
    });
  }
  _onMessage(message) {
    return __awaiter(this, void 0, void 0, function*() {
      this.chat.logMessage(message);
    });
  }
  _onUserEnter(roomId, user) {
    return __awaiter(this, void 0, void 0, function*() {
      console.log(`${user.displayName} entered`);
      if (user.id === 15071) {
        this.chat.sendMessage(
          `Your ruler and master **${user.displayName}** has entered the chat`,
          roomId
        );
      }
    });
  }
  _onUserMuted(userId, roomId, isGlobal, user) {
    return __awaiter(this, void 0, void 0, function*() {
      if (user) this.chat.sendMessage(`${user.displayName} got unmuted.`, roomId);
      if (user.id === this.clientUser.id) this.chat.sendMessage('Oh shit I got muted!', roomId);
    });
  }
}
__decorate([once('client-ready')], Bot.prototype, '_onReady', null);
__decorate([on('message')], Bot.prototype, '_onMessage', null);
__decorate([on('user-enter-room')], Bot.prototype, '_onUserEnter', null);
__decorate([on('user-unmuted')], Bot.prototype, '_onUserMuted', null);
const mrwhale = new Bot().start();
