import { ConsoleLogger } from '../../util/logger/ConsoleLogger';

import Sequelize = require('sequelize');

/**
 * Handles sequelize database connections and stores connection instance
 */
export class SequelizeDatabase {
  private readonly logger: ConsoleLogger = ConsoleLogger.instance;

  /**
   * The sequelize database client.
   */
  public readonly db: Sequelize.Sequelize;

  /**
   * Creates an instance of Database.
   * @param [url] The database connection string.
   */
  private constructor(url?: string) {
    if (SequelizeDatabase._instance)
      throw new Error(
        'There is already a database instance You can only have one database instance.'
      );

    this._url = url;
    this.db = new Sequelize(url);
  }

  private _url: string;
  private static _instance: SequelizeDatabase;

  /**
   *
   * Singleton. Returns the database instance
   * @static
   * @param {string} [url]
   * @returns {Database}
   * @memberof Database
   */
  public static instance(url?: string): SequelizeDatabase {
    if (this._instance) {
      return this._instance;
    } else {
      return new SequelizeDatabase(url);
    }
  }

  /**
   * Authenticate connection to database.
   */
  public async init(): Promise<void> {
    try {
      await this.db.authenticate();
    } catch (ex) {
      console.error(new Error(`Could not connect to the database. Error: ${ex}`));
      process.exit();
    }
  }
}
