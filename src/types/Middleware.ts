import { Message } from 'gamejolt.js';

/**
 * Middleware function definition.
 */
export type Middleware = (
  message: Message,
  args: any[]
) => Promise<[Message, any[]]> | [Message, any[]];
