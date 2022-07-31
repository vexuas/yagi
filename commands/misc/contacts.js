//Reminder comment to add Yagi discord server in contacts before v2.5
module.exports = {
  name: 'contacts',
  description: 'Shows platforms in which you can contact the owner',
  execute(message) {
    const embed = {
      description:
        'If you have any feedback or just want to hit me up, you can reach me through any of the platforms listed below!',
      color: 32896,
      fields: [
        {
          name: 'Discord',
          value: '• ID: `Vexuas#8141`\n• `AKUS Server`',
          inline: true,
        },
        {
          name: 'Aura Kingdom',
          value: '• Olympus(ex-Chimera): `Vexuas`',
          inline: true,
        },
        {
          name: 'Yagi',
          value:
            '• [Discord Support Server](https://discord.gg/7nAYYDm)\n• [Codebase](https://github.com/vexuas/yagi)',
        },
        {
          name: 'Others',
          value:
            'Twitter: [@cptvxcltch](https://twitter.com/cptvxcltch)\nGithub: [vexuas](https://github.com/vexuas)',
        },
      ],
    };
    message.channel.send({ embeds: [embed] });
  },
};
