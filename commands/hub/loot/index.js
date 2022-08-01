const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder().setName('loot').setDescription('placeholder'),
  async execute({ interaction }) {
    try {
      await interaction.deferReply();
      await interaction.editReply('Loot command');
    } catch (error) {
      console.log(error);
    }
  },
};
