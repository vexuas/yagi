const guildConfig = require('../../config/guild.json');

module.exports = {
  name: 'contacts',
  description: 'Shows platforms in which you can contact the owner',
  execute(message) {
    const currentPrefix = guildConfig[message.guild.id].prefix;
    const embed = {
      description:
        'If you have any feedback or just want to hit me up, you can reach me through any of the platforms listed below!',
      color: 32896,
      fields: [
        {
          name: 'Discord',
          value: '• ID: `Vexuas#8141`\n• `AKUS Server`',
          inline: true
        },
        {
          name: 'Aura Kingdom',
          value: '• Olympus(ex-Chimera): `Vexuas`',
          inline: true
        },
        {
          name: 'Yagi',
          value:
            "• Use yagi's `message` command\n• This sends a message through the bot to me and I'll try to reply whenever I can!\n• For help, type `" +
            currentPrefix +
            'help message`'
        },
        {
          name: 'Others',
          value:
            'Twitter: [@cptvxcltch](https://twitter.com/cptvxcltch)\nGithub: [vexuas](https://github.com/vexuas)'
        }
      ]
    };
    message.channel.send({ embed });
  }
};
