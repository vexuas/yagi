import About from '../../src/commands/about';
import MockDiscord from '../mocks/MockDiscord';

it.only('this is a test', () => {
  const mockDiscord = new MockDiscord();
  const testClient = mockDiscord.getClient();
  console.log(testClient);
  // About.execute({ interaction: MockCommandInteraction, yagi: testClient });
  console.log(About.data);
});
