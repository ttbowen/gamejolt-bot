import { ConsoleLogger } from './ConsoleLogger';


/**
 * 
 * Propery decorator that will assign logger instance to property
 * @export
 * @template T
 * @param {T} target
 * @param {string} key
 */
export function consoleLogger<T>(target: T, key: string): void {
    Object.defineProperty(target, key, { value: ConsoleLogger.instance });
}