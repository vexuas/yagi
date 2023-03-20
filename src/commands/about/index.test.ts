import { Client } from 'discord.js';
import { generateAboutEmbed } from '.';
import { BOT_VERSION } from '../../version';

describe('About Command', () => {
  it('generates an embed correctly', () => {
    const embed = generateAboutEmbed();

    expect(embed).not.toBeUndefined();
  });
  it('displays the correct fields in the embed', () => {
    const embed = generateAboutEmbed();

    expect(embed.title).toBeDefined();
    expect(embed.description).toBeDefined();
    expect(embed.color).toBeDefined();
    expect(embed.thumbnail.url).toBeDefined();
    expect(embed.fields).toBeDefined();
    expect(embed.fields.length).toBe(6);
  });
  it('displays the correct description if client is passed in', () => {
    const yagi = new Client({ intents: [] });
    const embed = generateAboutEmbed(yagi);

    expect(embed).not.toBeUndefined();
    expect(embed.description).toBeDefined();
    expect(embed.description.includes('0 servers')).toBeTruthy();
  });
  it('displays the correct bot version', () => {
    const embed = generateAboutEmbed();
    expect(embed.fields[2].name).toBe('Version');
    expect(embed.fields[2].value).toBe(BOT_VERSION);
  });
});
