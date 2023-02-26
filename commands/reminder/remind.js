module.exports = {
  name: 'remind',
  description:
    'Activates a reminder inside a channel that pings users when world boss is spawning soon',
  hasArguments: true,
  async execute(message) {
    const embed = {
      title: 'Reminder',
      color: 32896,
      description:
        'Temporary disabling the `remind` command for now as a newer and better version of it is currently being developed.\n\nIf you had this feature enabled before, feel free to delete the reminder channel and role. Sorry for the inconvenience!',
    };
    await message.channel.send({ embeds: [embed] });
  },
};
