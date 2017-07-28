/**
 * Options for extra help information
 * 
 * @typedef {object} ExtraHelp
 * @property {string} [commandName] The name of the command.
 * @property {string} [description] The description
 * @property {string} [args] The command arguments
 */
export type ExtraHelp = {
    commandName: string,
    description: string,
    args: string
}