import { generateReminderEmbed } from '.';

describe('Invite Command', () => {
  it('generates an embed correctly', () => {
    const embed = generateReminderEmbed();

    expect(embed).not.toBeUndefined();
  });
  it('displays the correct fields in the embed', () => {
    const embed = generateReminderEmbed();

    expect(embed.title).not.toBeUndefined();
    expect(embed.color).not.toBeUndefined();
    expect(embed.description).not.toBeUndefined();
  });
});
