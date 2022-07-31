const generateEmbed = function generateEmbedForGoatSheets(message) {
  const embed = {
    title: 'Public Sheets',
    description:
      'Kudos to all the leads and editors for being awesome and making all this possible!\nFor more information about the Olympus World Boss, do visit these links!\n[Olympus Sheet](https://docs.google.com/spreadsheets/d/tUL0-Nn3Jx7e6uX3k4_yifQ/edit#gid=585652389) | [Olympus Discord](https://discordapp.com/invite/bC9zWYs) | [Olympus Recruitment](https://docs.google.com/forms/d/e/1FAIpQLSfcLEBugvL70lLCttUiSHw_Cc6wI8S1te6X-CAsP8N-dr6u_w/viewform)',
    color: 32896,
    fields: [
      {
        name: 'OG links',
        value:
          '[Catalyst (Chimera)](https://tinyurl.com/catalyst-ak)\n[Angels (Phoenix)](https://docs.google.com/spreadsheets/d/1MrMwNerILxNK0lvKCBklkYZx_OKAb4io8XdaldRyO_g/edit#gid=1305398803)\n[Lazy Goat (Phoenix)](https://tinyurl.com/LazyGoatWB)',
        inline: true,
      },
    ],
  };
  return embed;
};

module.exports = {
  name: 'sheets',
  description:
    'A collection of current and previous sheets used by leads/editors to keep track of World Boss',
  execute(message) {
    try {
      const embed = generateEmbed(message);
      message.channel.send({ embeds: [embed] });
    } catch (e) {
      console.log(e);
    }
  },
};
