import { generateSheetsEmbed } from '.';

describe('Sheets Command', () => {
  it('generates an embed correctly', () => {
    const embed = generateSheetsEmbed();

    expect(embed).not.toBeUndefined();
  });
  it('displays the correct fields in the embed', () => {
    const embed = generateSheetsEmbed();

    expect(embed.title).not.toBeUndefined();
    expect(embed.color).not.toBeUndefined();
    expect(embed.description).not.toBeUndefined();
    expect(embed.fields).not.toBeUndefined();
    expect(embed.fields && embed.fields.length).toBe(1);
  });
});
