import * as glob from 'glob';
import * as path from 'path';

import { Client } from '../core/client/Client';
import { Command } from './Command';


/**
 * 
 * Load command modules and plugins
 * @export
 * @class CommandLoader
 * @template T
 */
export class CommandLoader<T extends Client> {

	private _loadedCommands: number;
	private _client: T;

	public constructor(client: T) {
		this._client = client;
		this._loadedCommands = 0;
	}

    /**
     * 
     * Get loaded command count
     * @readonly
     * 
     * @memberof CommandLoader
     */
	public get loadedCommands(): number {
		return this._loadedCommands;
	}

    /**
     * Find and load commands from command directories
     * @memberof CommandLoader
     */
	public loadCommands(): void {
		if (this._client.commands.size > 0) {
			this._client.commands.clear();
			this._loadedCommands = 0;
		}

		let files: string[] = [];

		files.push(...glob.sync(`${path.join(__dirname, './base')}/**/*.js`));

		if (this._client.commandDir) files.push(...glob.sync(`${this._client.commandDir}/**/*.js`));

		for (const file of files) {
			const commandLocation: string = file.replace('.js', '');

			const loadedClass: any = this.loadCommandClass(commandLocation);
			const command: Command<T> = new loadedClass();

			command.commandLoc = commandLocation;

			this._client.commands.register(this._client, command, command.name);
			this._loadedCommands++;
		}
	}


	/**
	 * 
	 * Reload the specified command by name or alias
	 * @param {string} command
	 * @returns {boolean}
	 * 
	 * @memberof CommandLoader
	 */
	public reloadCommand(command: string): boolean {
		const name: string = this._client.commands.findByNameOrAlias(command).name;
		if (!name) return false;

		const commandLocation: string = this._client.commands.get(name).commandLoc;
		const loadedCommand: any = this.loadCommandClass(commandLocation);
		const cmd: Command<T> = new loadedCommand(this._client);
		cmd.commandLoc = commandLocation;
		this._client.commands.register(this._client, cmd, cmd.name, true);
		return false;
	}

	private loadCommandClass(classLocation: string): typeof Command {
		const moduleObj: any = require(classLocation);

		let command: typeof Command;

		if (moduleObj && Object.getPrototypeOf(moduleObj).name !== 'Command') {
			for (const key of Object.keys(moduleObj)) {
				if (Object.getPrototypeOf(moduleObj[key]).name === 'Command') {
					command = moduleObj[key];
					break;
				}
			}
		} else command = moduleObj;
		return command;
	}
}