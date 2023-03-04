const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loot')
    .setDescription('Displays the loot dropped by World Bosses'),
  async execute({ interaction }) {
    try {
      const embed = {
        color: 32896,
        thumbnail: {
          url: 'https://cdn.aurakingdom-db.com/file/bb-akdb/images/icons/I00025.png',
        },
        footer: {
          text: 'Opening the chest gives a chance in obtaining any one of these items',
        },
        fields: [
          {
            name: 'Loot | BattleFront Merit Chest',
            value:
              "• Hidden Demon's Hood\n• Baphomet's Assault Armor\n• Demon's Fortified Warhelm\n• Bisolen's Bulwark Armor\n• Healing Potion (Non-Tradable)\n• Secret Stone Randomizer (Non-Tradable)\n• Treasure Charm (Non-Tradable)\n• 50 Loyalty Points (Non-Tradable)\n• Aura Kingdom Coupon: 2000 Points\n• Banoleth Scythe\n• King Banoleth Scythe",
          },
        ],
      };
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.log(error);
    }
  },
};
