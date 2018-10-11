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
   * @param port Redis port to connect on.
   * @param host Redis hostname.
   * @param [clientOptions] Redis client options.
   */
  private constructor(port: number, host: string, clientOptions?: redis.ClientOpts) {
    if (RedisProvider._instance)
      throw new Error(
        'There is already a database instance You can only have one database instance.'
      );
    this._port = port;
    this._host = host;
    this._options = clientOptions || {};

    RedisProvider._instance = this;
  }

  /**
   * Returns the database instance.
   * @param port The redis server port.
   * @param host The redis host.
   * @param [clientOptions] The client options.
   */
  public static instance(
    port?: number,
    host?: string,
    clientOptions?: redis.ClientOpts
  ): RedisProvider {
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
   * Initialise the redis instance.
   */
  public async init(): Promise<void> {
    if (!this._options) this.client = redis.createClient(this._port, this._host);
    else this.client = redis.createClient(this._port, this._host, this._options);

    this._addListeners();
  }

  private _addListeners(): void {
    this.client.on('connect', () => {
      this.logger.log('redis', 'Connected to redis.');
    });
    this.client.on('reconnecting', () => {
      this.logger.warn('redis', 'Reconnected to redis.');
    });
    this.client.on('error', () => {
      this.logger.error('redis', 'A redis error occured.');
    });
  }

  /**
   * Get redis keys.
   * @param [pattern] Get key with matching pattern.
   */
  public async keys(pattern?: string): Promise<any> {
    if (!pattern) pattern = '*';

    return this.client
      .multi()
      .keys(pattern)
      .execAsync()
      .catch(err => {
        this.logger.error('redis', 'Error:' + err);
      });
  }

  /**
   * Get a redis key.
   * @param key The name of the key to get.
   */
  public async get(key: string): Promise<any> {
    return this.client.getAsync(key);
  }

  /**
   * Set a redis key.
   * @param key The name of the key to set.
   * @param value The value to set.
   */
  public async set(key: string, value: any): Promise<any> {
    return this.client
      .multi()
      .set(key, value)
      .execAsync()
      .catch(err => {
        this.logger.error('redis', 'Error:' + err);
      });
  }

  /**
   * Set a redis key with a time-to-live value.
   * @param key The key to set.
   * @param value The value to set.
   * @param {number} ttl The time to live value for key.
   */
  public async setExpire(key: string, value: any, ttl: number): Promise<any> {
    return this.client
      .multi()
      .set(key, value)
      .expire(key, ttl)
      .execAsync()
      .catch(err => {
        this.logger.error('redis', 'Error:' + err);
      });
  }

  /**
   * Delete a storage key.
   * @param key The key to remove.
   */
  public async remove(key: string): Promise<any> {
    return this.client
      .multi()
      .del(key)
      .execAsync()
      .catch(err => {
        this.logger.error('redis', 'Error:' + err);
      });
  }

  /**
   * Push an item to a list.
   * @param list The name of the list.
   * @param item The item to push.
   */
  public async lpush(list: string, item: any): Promise<any> {
    return this.client
      .multi()
      .lpush(list, item)
      .execAsync()
      .catch(err => {
        this.logger.error('redis', 'Error:' + err);
      });
  }

  /**
   * Remove last item from a list.
   * @param list The name of the list.
   */
  public async lpop(list: string): Promise<any> {
    return this.client
      .multi()
      .lpop(list)
      .execAsync()
      .catch(err => {
        this.logger.error('redis', 'Error:' + err);
      });
  }

  /**
   * Remove an item from a list.
   * @param list The name of the list.
   * @param count The number of items to remove.
   * @param item The item to remove.
   */
  public async listRemove(list: string, count: number, item: any): Promise<any> {
    return this.client
      .multi()
      .lrem(list, count, item)
      .execAsync()
      .catch(err => {
        this.logger.error('redis', 'Error:' + err);
      });
  }

  /**
   * Get a range of items from a list.
   * @param list The name of the list.
   * @param start The start range index.
   * @param stop The end range index.
   */
  public async listRange(list: string, start: number, stop: number): Promise<any> {
    return this.client
      .multi()
      .lrange(list, start, stop)
      .execAsync()
      .catch(err => {
        this.logger.error('redis', 'Error:' + err);
      });
  }

  /**
   * Check if a key exists in redis store.
   * @param key The name of the key.
   */
  public async keyExists(key: string): Promise<boolean> {
    return this.client
      .multi()
      .exists(key)
      .execAsync()
      .catch(err => {
        this.logger.error('redis', 'Error:' + err);
      });
  }

  /**
   * Save a hash to redis
   * @param hash The hash.
   * @param object The object to save.
   */
  public async hmset(hash: string, object: any): Promise<any> {
    return this.client
      .multi()
      .hmset(hash, object)
      .execAsync()
      .catch(err => {
        this.logger.error('redis', 'Error:' + err);
      });
  }

  /**
   * Retrieve a hash from redis
   * @param hash The hash to get.
   */
  public async hget(hash: string): Promise<any> {
    return this.client
      .multi()
      .hgetall(hash)
      .execAsync()
      .catch(err => {
        this.logger.error('redis', 'Error:' + err);
      });
  }

  /**
   * Get all fields from redis hash.
   * @param key The key to get.
   */
  public async hgetall(key: string): Promise<any> {
    return this.client
      .multi()
      .hgetall(key)
      .execAsync()
      .catch(err => {
        this.logger.error('redis', 'Error:' + err);
      });
  }
}
