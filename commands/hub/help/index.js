const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('placeholder'),
  async execute({ interaction }) {
    try {
      await interaction.deferReply();
      await interaction.editReply('Help command');
    } catch (error) {
      console.log(error);
    }
  },
};
