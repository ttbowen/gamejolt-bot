import { Message } from 'gamejolt.js';
import { Command } from '../../Command';
import { Permissions } from '../../../types/Permissions';

export default class extends Command {
    public constructor() {
        super({
            name: 'reload',
            description: 'Reload a command.',
            usage: '<prefix> reload [command]',
            type: 'manage',
            aliases: ['r'],
            ownerOnly: true,
            ignoreCooldown: true
        });
    }

    public async invoke(message: Message, [commandName]: [string]): Promise<void> {
        const start: [number, number] = process.hrtime();
        const command: Command = this.client.commands.findByNameOrAlias(commandName);
		
        if (commandName && !command) {
            return message.reply(`'${commandName}' is not a valid command name.`);
        }

        if (command) this.client.reloadCommand(command.name)
        else this.client.reloadCommand('all');

        const end: [number, number] = process.hrtime(start);

        return message.reply(`Command(s) sucessfully reloaded. Time taken: ${end[0]}s ${(end[1] / 1000000)}ms`);
    }
}