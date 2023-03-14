import { Client } from 'discord.js';
import fs from 'fs';
import { Mixpanel } from 'mixpanel';
import path from 'path';
import { getApplicationCommands } from '../commands/commands';

const appCommands = getApplicationCommands();

interface Props {
  yagi: Client;
  mixpanel: Mixpanel | null;
}
/**
 * Handler to register event listeners for Yagi
 * Event listeners are housed in their own folders and exported
 * Below reads the files inside the /events folder and automatically imports and executes the exported listeners
 * Since each of the listeners are in their own folders, the handler is recursive to go one more folder deeper
 */
export function registerEventHandlers({ yagi, mixpanel }: Props): void {
  const loadModules = (directoryPath: string) => {
    fs.readdir(directoryPath, { withFileTypes: true }, (error, files) => {
      if (error) {
        console.log(error);
      }
      files.forEach((file) => {
        const filePath = path.join(directoryPath, file.name);
        if (file.isDirectory()) {
          return loadModules(filePath);
        }
        if (file.name === 'index.js') {
          const modulePath = `./${filePath.replace('src/events', '')}`;
          const currentModule = require(modulePath);
          currentModule({ yagi, appCommands, mixpanel });
        }
      });
    });
  };
  loadModules('./src/events');
}
