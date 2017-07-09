import * as path from 'path';

export { Client } from './core/Client/Client';
export { Command } from './command/Command';
export { CommandDispatcher } from './command/CommandDispatcher';
export { CommandRateLimiter } from './command/CommandRateLimiter';
export { CommandRateLimit } from './command/CommandRateLimit';
export { ICommand } from './command/ICommand';
export { CommandLoader } from './command/CommandLoader';
export { CommandStorage } from './command/CommandStorage';
export { ClientOptions } from './types/ClientOptions';
export { BotOptions } from './types/BotOptions';
export { expect } from './command/middleware/Expect';
export { resolve } from './command/middleware/Resolve';
export { LogLevel } from './types/LogLevel';
export { RedisProvider } from './storage/database/RedisProvider';
export { SequelizeProvider } from './storage/database/SequelizeProvider';
export { SequelizeDatabase } from './storage/database/SequelizeDatabase';
export { Collection } from './util/Collection';
export { CommandOptions } from './types/CommandOptions';
export { Modes } from './types/Modes';
export { Middleware } from './types/Middleware';
export { Time } from './types/Time';
export { Permissions } from './types/Permissions';
export { RoomNames } from './types/RoomNames';
export { Logger } from './util/Logger/interface/Logger';
export { ConsoleLogger } from './util/Logger/ConsoleLogger';
export { consoleLogger } from './util/Logger/ConsoleLoggerDecorator';

export { TimeUtil } from './util/TimeUtil';
export { ListenerDecorators } from './util/Listener/ListenerDecorators';
export { Util } from './util/Util';

export * from './command/CommandDecorators';

export const version: string = require(path.join(__dirname, '..', 'package')).version;