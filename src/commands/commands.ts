import { SlashCommandBuilder } from '@discordjs/builders';
import { Client, CommandInteraction} from 'discord.js';
import fs from 'fs';
import path from 'path';
/**
 * Handler to get application commands to be used in event listeners/registers
 * Similar to how we load event listeners to read files
 * Uses readdirSync however as we want to finish reading the files first
 * This is so we can return an actual appCommands object
 */
export type AppCommands = {
  about?: AppCommand;
  goats?: AppCommand;
  help?: AppCommand;
  invite?: AppCommand;
  loot?: AppCommand;
  remind?: AppCommand;
  sheets?: AppCommand;
};
export type AppCommand = {
  data: SlashCommandBuilder;
  execute: (data: AppCommandOptions) => void;
};
export type AppCommandOptions = {
  interaction: CommandInteraction;
  yagi?: Client;
};
type ExportedAppCommand = {
  default: AppCommand;
};
export function getApplicationCommands(): AppCommands {
  const appCommands: AppCommands = {};
  const loadModules = (directoryPath: string) => {
    const files = fs.readdirSync(directoryPath, { withFileTypes: true });
    files.forEach((file) => {
      const filePath = path.join(directoryPath, file.name);
      if (file.isDirectory()) {
        return loadModules(filePath);
      }
      if (file.name === 'index.js') {
        const modulePath = `./${filePath.replace('dist/commands/', '')}`;
        const currentModule = require(modulePath) as ExportedAppCommand;
        appCommands[directoryPath.replace('dist/commands/', '') as keyof AppCommands] =
          currentModule.default;
      }
    });
  };
  loadModules('./dist/commands');
  return appCommands as AppCommands;
}
