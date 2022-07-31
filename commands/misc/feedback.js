module.exports = {
  name: 'feedback',
  description: `Displays a feedback form and invite link to yagi's support server`,
  execute(message) {
    const embed = {
      description: `Thanks for using yagi ${message.author}!\n\nIf you have any feedback, feel free to add them [here! (◕ᴗ◕✿)](https://cyhmwysg8uq.typeform.com/to/szg4bUPU)\n\nOr join the [support server](https://discord.gg/7nAYYDm) if you have any questions and want to keep up-to-date with yagi's development!`,
      color: 32896,
    };
    message.channel.send({ embeds: [embed] });
  },
};
