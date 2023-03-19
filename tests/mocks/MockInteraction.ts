import { Client, Interaction } from 'discord.js';
import { RawInteractionData } from 'discord.js/typings/rawDataTypes';

export default class MockInteraction extends Interaction {
  constructor(client: Client, data: RawInteractionData) {
    super(client, data);
  }
}
