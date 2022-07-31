const { format } = require('date-fns');
const package = require('../../package.json');
const grvAcnt = '`';

const sendInfoEmbed = function designOfYagiInformationEmbed(message, yagi, yagiPrefix) {
  const embed = {
    title: 'Info',
    description: `Hi there! I'm Yagi and I provide information for the world bosses of Vulture's Vale and Blizzard Berg in Aura Kingdom EN!\n\nInitially my creator only wanted to make a [website](https://ak-goats.com/) but eventually opted to make a discord version as well! Since then I'm currently serving ${yagi.guilds.cache.size} servers!\n\nMy timer data is extracted from the player-run [Olympus WB Sheet](https://docs.google.com/spreadsheets/d/tUL0-Nn3Jx7e6uX3k4_yifQ/edit#gid=585652389). Kudos to the hardwork of the editors and leads in the team!\n\nMy prefix  is ${grvAcnt}${yagiPrefix}${grvAcnt} | For a detailed list of my commands, type ${grvAcnt}${yagiPrefix}help${grvAcnt}`, //Removed users for now
    color: 32896,
    thumbnail: {
      url: 'https://cdn.discordapp.com/attachments/491143568359030794/500863196471754762/goat-timer_logo_dark2.png',
    },
    fields: [
      {
        name: 'Creator',
        value: 'Vexuas#8141',
        inline: true,
      },
      {
        name: 'Date Created',
        value: format(yagi.user.createdTimestamp, 'DD-MM-YYYY'),
        inline: true,
      },
      {
        name: 'Version',
        value: package.version,
        inline: true,
      },
      {
        name: 'Library',
        value: 'discord.js',
        inline: true,
      },
      {
        name: 'Support Server',
        value: '[Come join!](https://discord.gg/7nAYYDm)',
        inline: true,
      },
      {
        name: 'Feedback Form',
        value: '[Click me! (◕ᴗ◕✿)](https://cyhmwysg8uq.typeform.com/to/szg4bUPU)',
        inline: true,
      },
    ],
  };
  return message.channel.send({ embeds: [embed] });
};

module.exports = {
  name: 'info',
  description: 'The story and information hub of yagi',
  execute(message, arguments, yagi, commands, yagiPrefix) {
    sendInfoEmbed(message, yagi, yagiPrefix);
  },
};
