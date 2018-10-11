import { LogLevel } from '../../../types/LogLevel';

/**
 *
 * Provides an interface for loggers
 * @export
 * @interface Logger
 */
export interface Logger {
  setLogLevel(level: LogLevel): void;
  log(tag: string, ...text: string[]): Promise<void>;
  info(tag: string, ...text: string[]): Promise<void>;
  debug(tag: string, ...text: string[]): Promise<void>;
  warn(tag: string, ...text: string[]): Promise<void>;
  error(tag: string, ...text: string[]): Promise<void>;
}
