import { Client, User } from 'discord.js';
import { RawUserData } from 'discord.js/typings/rawDataTypes';

export default class MockUser extends User {
  constructor(client: Client, data: RawUserData) {
    super(client, data);
  }
}
