import About from '../../src/commands/about';
import MockCommandInteraction from '../mocks/CommandInteraction.json';

it.only('this is a test', () => {
  console.log(MockCommandInteraction);
  About.execute({ interaction: MockCommandInteraction });
  console.log(About.data);
});
