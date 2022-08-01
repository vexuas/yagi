const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder().setName('remind').setDescription('placeholder'),
  async execute({ interaction }) {
    try {
      await interaction.deferReply();
      await interaction.editReply('Remind command');
    } catch (error) {
      console.log(error);
    }
  },
};
