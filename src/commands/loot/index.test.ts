import { generateLootEmbed } from '.';

describe('Invite Command', () => {
  it('generates an embed correctly', () => {
    const embed = generateLootEmbed();

    expect(embed).not.toBeUndefined();
  });
  it('displays the correct fields in the embed', () => {
    const embed = generateLootEmbed();

    expect(embed.color).not.toBeUndefined();
    expect(embed.thumbnail).not.toBeUndefined();
    expect(embed.thumbnail && embed.thumbnail.url).not.toBeUndefined();
    expect(embed.footer).not.toBeUndefined();
    expect(embed.footer && embed.footer.text).not.toBeUndefined();
    expect(embed.fields).not.toBeUndefined();
    expect(embed.fields && embed.fields.length).toBe(1);
  });
});
