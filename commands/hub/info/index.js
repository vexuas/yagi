const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder().setName('info').setDescription('placeholder'),
  async execute({ interaction }) {
    try {
      await interaction.deferReply();
      await interaction.editReply('Info command');
    } catch (error) {
      console.log(error);
    }
  },
};
