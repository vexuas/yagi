const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('Directory hub of commands'),
  async execute({ interaction }) {
    try {
      const embed = {
        color: 32896,
        description: 'Below you can see all the commands that I know!',
        fields: [
          {
            name: 'Timer',
            value: '`goats`, `remind`',
          },
          {
            name: 'Information',
            value: '`about`, `help`, `loot`, `invite`, `sheets`',
          },
        ],
      };
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.log(error);
    }
  },
};
