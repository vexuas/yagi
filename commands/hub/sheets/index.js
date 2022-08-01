const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder().setName('sheets').setDescription('placeholder'),
  async execute({ interaction }) {
    try {
      await interaction.deferReply();
      await interaction.editReply('Sheets command');
    } catch (error) {
      console.log(error);
    }
  },
};
