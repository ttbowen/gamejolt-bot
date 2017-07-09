import { Logger } from './interface/Logger';
import { LogLevel } from '../../types/LogLevel';

import * as colour from 'colour';
import * as moment from 'moment';

/**
 * 
 * Log data to the console
 * @export
 * @class ConsoleLogger
 * @implements {Logger}
 */
export class ConsoleLogger implements Logger {

    private static _instance: ConsoleLogger;
    private _logLevel: LogLevel;

    public static readonly NONE: LogLevel = LogLevel.NONE;
    public static readonly LOG: LogLevel = LogLevel.LOG;
    public static readonly WARN: LogLevel = LogLevel.WARN;
    public static readonly DEBUG: LogLevel = LogLevel.DEBUG;
    public static readonly INFO: LogLevel = LogLevel.INFO;
    public static readonly ERROR: LogLevel = LogLevel.ERROR;

    private constructor() {
        if (ConsoleLogger._instance) throw new Error('Cannot have multiple instance of Logger.');

        ConsoleLogger._instance = this;
        this._logLevel = LogLevel.LOG;
    }

    /**
     * 
     * Logger Singleton
     * @readonly
     * @static
     * @type {ConsoleLogger}
     * @memberof ConsoleLogger
     */
    public static get instance(): ConsoleLogger {
        if (!ConsoleLogger._instance) return new ConsoleLogger();
        return ConsoleLogger._instance;
    }


    /**
     * 
     * Set the log level the logger will putput
     * @param {LogLevel} level
     * 
     * @memberof ConsoleLogger
     */
    public setLogLevel(level: LogLevel): void {
        this._logLevel = level
    }


    /**
     * 
     * 
     * @param {...string[]} text
     * @returns {Promise<void>}
     * 
     * @memberof ConsoleLogger
     */
    public async log(tag: string, ...text: string[]): Promise<void> {
        if (this._logLevel < ConsoleLogger.INFO) return;
        this._output('LOG', tag, text.join(' '));
    }


    /**
     * 
     * 
     * @param {string} tag 
     * @param {...string[]} text 
     * @returns {Promise<void>} 
     * @memberof ConsoleLogger
     */
    public async info(tag: string, ...text: string[]): Promise<void> {
        if (this._logLevel < ConsoleLogger.INFO) return;
        this._output('INFO', tag, text.join(' '));
    }


    /**
     * 
     * 
     * @param {string} tag 
     * @param {...string[]} text 
     * @returns {Promise<void>} 
     * @memberof ConsoleLogger
     */
    public async debug(tag: string, ...text: string[]): Promise<void> {
        if (this._logLevel < ConsoleLogger.DEBUG) return;
        this._output('DEBUG', tag, text.join(' '));
    }

    /**
     * 
     * 
     * @param {string} tag 
     * @param {...string[]} text 
     * @returns {Promise<void>} 
     * @memberof ConsoleLogger
     */
    public async warn(tag: string, ...text: string[]): Promise<void> {
        if (this._logLevel < ConsoleLogger.WARN) return;
        this._output('WARN', tag, text.join(' '));
    }

    /**
     * 
     * 
     * @param {string} tag 
     * @param {...string[]} text 
     * @returns {Promise<void>} 
     * @memberof ConsoleLogger
     */
    public async error(tag: string, ...text: string[]): Promise<void> {
        if (this._logLevel < ConsoleLogger.ERROR) return;
        this._output('WARN', tag, text.join(' '));
    }

    private _output(type: string, tag: string, text: string): void {

        const timestamp = moment()
            .format('hh:mm:ss');

        process.stdout.write(`[${timestamp}] [${type}] [${tag}]: ${text}\n`);
    }
}