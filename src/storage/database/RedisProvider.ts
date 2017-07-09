import * as redis from 'redis';
import * as bluebird from 'bluebird';

import { ConsoleLogger } from '../../util/logger/ConsoleLogger';

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

export class RedisProvider {

    private readonly logger: ConsoleLogger = ConsoleLogger.instance;

    private client: redis.RedisClient;
    private static _instance: RedisProvider;
    private _port: number;
    private _host: string;
    private _options: redis.ClientOpts;


    /**
     * Creates an instance of RedisProvider.
     * @param {number} port Redis port to connect on
     * @param {string} host Redis hostname
     * @param {redis.ClientOpts} [clientOptions] Redis client options
     * @memberof RedisProvider
     */
    private constructor(port: number, host: string, clientOptions?: redis.ClientOpts) {

        if (RedisProvider._instance) throw new Error('There is already a database instance You can only have one database instance.');
        this._port = port;
        this._host = host;
        this._options = clientOptions || {};

        RedisProvider._instance = this;
    }


    /**
     * 
     * Singleton. Returns the database instance
     * @static
     * @param {number} port 
     * @param {string} host 
     * @param {redis.ClientOpts} clientOptions 
     * @returns {RedisProvider} 
     * @memberof RedisProvider
     */
    public static instance(port?: number, host?: string, clientOptions?: redis.ClientOpts): RedisProvider {

        if (!port && !host && !RedisProvider._instance)
            throw new Error(`Port and host is required for first time redis database is accessed`);

        if (RedisProvider._instance) {
            return this._instance;
        } else {
            if (!clientOptions) return new RedisProvider(port, host);
            else return new RedisProvider(port, host, clientOptions);
        }
    }

    /**
     * 
     * Initialise the redis instance
     * @param {number} port 
     * @param {string} host 
     * @param {redis.ClientOpts} [clientOptions] 
     * @returns {Promise<void>} 
     * @memberof RedisProvider
     */
    public async init(): Promise<void> {
        if (!this._options)
            this.client = redis.createClient(this._port, this._host)
        else
            this.client = redis.createClient(this._port, this._host, this._options);

        this._addListeners();
    }

    private _addListeners(): void {
        this.client.on('connect', () => { this.logger.log('redis', 'Connected to redis.'); });
        this.client.on('reconnecting', () => { this.logger.warn('redis', 'Reconnected to redis.'); });
        this.client.on('error', () => { this.logger.error('redis', 'A redis error occured.'); });
    }


    /**
     * 
     * Get a redis key
     * @param {string} key 
     * @returns {Promise<any>} 
     * @memberof RedisProvider
     */
    public async get(key: string): Promise<any> {
        return this.client.getAsync(key);
    }


    /**
     * 
     * Set a redis key
     * @param {string} key 
     * @param {*} value 
     * @returns {Promise<any>} 
     * @memberof RedisProvider
     */
    public async set(key: string, value: any): Promise<any> {
        return this.client.multi()
            .set(key, value)
            .execAsync()
            .catch((err) => {
                this.logger.error('redis', 'Error:' + err);
            });
    }


    /**
     * 
     * Set a redis key with a time-to-live value
     * @param {string} key 
     * @param {*} value 
     * @param {number} ttl 
     * @returns 
     * @memberof RedisProvider
     */
    public async setExpire(key: string, value: any, ttl: number): Promise<any> {
        return this.client.multi()
            .set(key, value)
            .expire(key, ttl)
            .execAsync()
            .catch((err) => {
                this.logger.error('redis', 'Error:' + err);
            });
    }

    /**
     * 
     * Delete a storage key
     * @param {string} key 
     * @returns 
     * @memberof RedisProvider
     */
    public async remove(key: string): Promise<any> {
        return this.client.multi()
            .del(key)
            .execAsync()
            .catch((err) => {
                this.logger.error('redis', 'Error:' + err);
            });
    }

    /**
     * 
     * Push an item to a list
     * @param {string} list 
     * @param {*} item 
     * @returns 
     * @memberof RedisProvider
     */
    public async lpush(list: string, item: any): Promise<any> {
        return this.client.multi()
            .lpush(list, item)
            .execAsync()
            .catch((err) => {
                this.logger.error('redis', 'Error:' + err);
            });
    }

    /**
     * 
     * Remove last item from a list
     * @param {string} list 
     * @returns 
     * @memberof RedisProvider
     */
    public async lpop(list: string): Promise<any> {
        return this.client.multi()
            .lpop(list)
            .execAsync()
            .catch((err) => {
                this.logger.error('redis', 'Error:' + err);
            });
    }

    /**
     * 
     * Remove an item from a list
     * @param {string} list
     * param {number} count
     * @param {*} item 
     * @returns 
     * @memberof RedisProvider
     */
    public async listRemove(list: string, count: number, item: any): Promise<any> {
        return this.client.multi()
            .lrem(list, count, item)
            .execAsync()
            .catch((err) => {
                this.logger.error('redis', 'Error:' + err);
            });
    }


    /**
     * 
     * Get a range of items from a list
     * @param {string} list 
     * @param {number} start 
     * @param {number} stop 
     * @returns {Promise<any>} 
     * @memberof RedisProvider
     */
    public async listRange(list: string, start: number, stop: number): Promise<any> {
        return this.client.multi()
            .lrange(list, start, stop)
            .execAsync()
            .catch((err) => {
                this.logger.error('redis', 'Error:' + err);
            });
    }

    /**
     * 
     * Check if a key exists in redis store
     * @param {string} key 
     * @returns {Promise<boolean>} 
     * @memberof RedisProvider
     */
    public async keyExists(key: string): Promise<boolean> {
        return this.client.multi()
            .exists(key)
            .execAsync()
            .catch((err) => {
                this.logger.error('redis', 'Error:' + err);
            });
    }
}