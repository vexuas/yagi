const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('goats')
    .setDescription(`Shows current timer for Vulture's Vale and Blizzard Berg World Boss`),
  async execute({ interaction }) {
    try {
      await interaction.deferReply();
      await interaction.editReply('Goats command');
    } catch (error) {
      console.log(error);
    }
  },
};
