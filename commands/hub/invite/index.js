const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Generates an invite link for Yagi'),
  async execute({ interaction }) {
    try {
      const embed = {
        description: `<@${interaction.user.id}> | [Add me to your servers! (◕ᴗ◕✿)](https://tinyurl.com/yagi-invite)`,
        color: 32896,
      };
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.log(error);
    }
  },
};
