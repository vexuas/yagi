import { Client, User } from 'discord.js';
import MockUser from './MockUser';

export default class MockDiscord {
  private client!: Client;
  private user!: User;

  constructor() {
    this.mockClient();
    this.mockUser();
  }
  public getClient(): Client {
    return this.client;
  }
  public getUser(): User {
    return this.user;
  }
  private mockClient(): void {
    this.client = new Client({ intents: [] });
  }
  private mockUser(): void {
    this.user = new MockUser(this.client, {
      username: 'Vexuas',
      discriminator: 'Vexuas#8141',
      id: '12345',
    });
  }
}
