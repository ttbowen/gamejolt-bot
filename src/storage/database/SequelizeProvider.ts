import Sequelize = require('sequelize');

import { SequelizeDatabase } from './SequelizeDatabase';

export class SequelizeProvider {
  private _database: SequelizeDatabase;
  private _url: string;

  /**
   * Creates an instance of SequelizeProvider.
   * @param [url] The database connection string.
   */
  public constructor(url?: string) {
    this._url = url;
    this._database = SequelizeDatabase.instance(url);
  }

  private sequelize: Sequelize.Sequelize;

  /**
   * Gets the database instance.
   */
  public get database(): SequelizeDatabase {
    return this._database;
  }

  /**
   *
   * Initialise the sequelize database connection
   * @returns {Promise<void>}
   * @memberof SequelizeProvider
   */
  public async init(): Promise<void> {
    await this._database.init();
    await this._database.db.sync();
  }

  /**
   * Send a raw SQL query to database.
   * @param query The sql query.
   * @param [options] Sequelize options.
   */
  public async query(query: string, options?: Sequelize.QueryOptions): Promise<any> {
    return this._database.db.query(query, options);
  }

  /**
   * Define a new model.
   * @param name The name of the model.
   * @param attributes Model attributes.
   */
  public async defineModel(name: string, attributes: Sequelize.DefineAttributes): Promise<void> {
    this._database.db.define(name, attributes);
  }
}
