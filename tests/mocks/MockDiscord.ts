import { Client, Interaction, User } from 'discord.js';
import MockInteraction from './MockInteraction';
import MockUser from './MockUser';

export default class MockDiscord {
  private client!: Client;
  private user!: User;
  private interaction!: Interaction;

  constructor() {
    this.mockClient();
    this.mockUser();
    this.mockInteraction();
  }
  public getClient(): Client {
    return this.client;
  }
  public getUser(): User {
    return this.user;
  }
  public getInteraction(): Interaction {
    return this.interaction;
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
  private mockInteraction(): void {
    this.interaction = new MockInteraction(this.client, {
      id: 'interaction-id',
      application_id: 'application_id',
      type: 2,
      token: 'token',
      version: 1,
      user: {
        id: this.user.id,
        username: this.user.username,
        discriminator: this.user.discriminator,
        avatar: this.user.avatar,
      },
    });
  }
}
