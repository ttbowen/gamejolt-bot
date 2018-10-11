import { ConsoleLogger } from './ConsoleLogger';

/**
 * Propery decorator that will assign logger instance to property.
 * @param target The object to target.
 * @param key The property to apply this to.
 */
export function consoleLogger<T>(target: T, key: string): void {
  Object.defineProperty(target, key, { value: ConsoleLogger.instance });
}
