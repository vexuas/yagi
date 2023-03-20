import { generateGoatsEmbed } from '.';

const validWorldBossData = {
  serverTime: 'March 20 2023 11:03:59 AM',
  nextSpawn: 'March 20 2023 11:45:41 AM',
  countdown: '41 mins 41 secs',
  accurate: true,
  location: 'V1',
  lastSpawn: '7:45:41 AM',
  projectedNextSpawn: 'March 20 2023 3:45:41 PM',
};

describe('Goats Command', () => {
  it('generates an embed correctly', () => {
    const embed = generateGoatsEmbed(validWorldBossData);

    expect(embed).not.toBeUndefined();
  });
  it('displays the correct fields in the embed', () => {
    const embed = generateGoatsEmbed(validWorldBossData);

    expect(embed.title).not.toBeUndefined();
    expect(embed.color).not.toBeUndefined();
    expect(embed.description).not.toBeUndefined();
    expect(embed.thumbnail).not.toBeUndefined();
    expect(embed.thumbnail && embed.thumbnail.url).not.toBeUndefined();
    expect(embed.footer).not.toBeUndefined();
    expect(embed.footer && embed.footer.text).not.toBeUndefined();
    expect(embed.fields).not.toBeUndefined();
    expect(embed.fields && embed.fields.length).toBe(3);
  });
  it('displays the correct description', () => {
    const embed = generateGoatsEmbed(validWorldBossData);

    expect(embed.description).not.toBeUndefined();
    expect(embed.description).toBe('Server Time: `Monday, 11:03:59 AM`\nSpawn: `v1, 11:45:41 AM`');
  });
  it('displays the correct Location field', () => {
    const embed = generateGoatsEmbed(validWorldBossData);

    expect(embed.fields).not.toBeUndefined();
    expect(embed.fields && embed.fields[0].name).toBe('Location');
    expect(embed.fields && embed.fields[0].value).toBe(
      "```fix\n\nVulture's Vale Ch.1 (X:161, Y:784)```"
    );
  });
  it('displays the correct Countdown field', () => {
    const embed = generateGoatsEmbed(validWorldBossData);

    expect(embed.fields).not.toBeUndefined();
    expect(embed.fields && embed.fields[1].name).toBe('Countdown');
    expect(embed.fields && embed.fields[1].value).toBe('```xl\n\n41 mins 41 secs```');
  });
  it('displays the correct Time of Spawn field', () => {
    const embed = generateGoatsEmbed(validWorldBossData);

    expect(embed.fields).not.toBeUndefined();
    expect(embed.fields && embed.fields[2].name).toBe('Time of Spawn');
    expect(embed.fields && embed.fields[2].value).toBe('```xl\n\n11:45:41 AM```');
  });
  it('displays the correct footer text if world boss data is not accurate', () => {
    const embed = generateGoatsEmbed({ ...validWorldBossData, accurate: false });

    expect(embed).not.toBeUndefined();
    expect(embed.footer).not.toBeUndefined();
    expect(embed.footer && embed.footer.text).toBe(
      "**Note that sheet data isn't up to date, timer accuracy might be off"
    );
  });
});
