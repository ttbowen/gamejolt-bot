import Sequelize = require('sequelize');

import { SequelizeDatabase } from './SequelizeDatabase';

export class SequelizeProvider {

    private _database: SequelizeDatabase;
    private _url: string;

    /**
     * Creates an instance of SequelizeProvider.
     * @param {string} [url] The database connection string
     * @memberof SequelizeProvider
     */
    public constructor(url?: string) {
        this._url = url;
        this._database = SequelizeDatabase.instance(url);
    }

    private sequelize: Sequelize.Sequelize;

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
     * Send a raw SQL query to database
     * @param {string} query 
     * @param {*} [options] 
     * @returns {Promise<any>} 
     * @memberof SequelizeProvider
     */
    public async query(query: string, options?: Sequelize.QueryOptions): Promise<any> {
        return this._database.db.query(query, options);
    }
    

    /**
     * 
     * Define a new model
     * @param {string} name 
     * @param {Sequelize.DefineAttributes} attributes 
     * @memberof SequelizeProvider
     */
    public async defineModel(name: string, attributes: Sequelize.DefineAttributes): Promise<void> {
        this._database.db.define(name, attributes);
    }
}