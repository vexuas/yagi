import { Client } from 'discord.js';

export default class MockDiscord {
  private client!: Client;

  constructor() {
    this.mockClient();
  }
  public getClient(): Client {
    return this.client;
  }
  private mockClient(): void {
    this.client = new Client({ intents: [] });
  }
}
