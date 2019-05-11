module.exports = {
  name: "contacts",
  description: "platforms to where to contact owner",
  execute(message, args) {
    const contactlist =
      "```• DiscordID: Vexuas#8141\n• In-game(Chimera): Vexuas\n• AKUS Discord Server```";
    const contact = `If you encounter any problems with the timers or have feedback about the bot, feel free to message me through any of the platforms listed.\n${contactlist}`;
    const embed = {
      description: `${contact}`,
      color: 32896,
      footer: {
        text:
          "Phoenix timer is known to be unstable and I'm currently working in having it patched up. Sorry!"
      }
    };
    message.channel.send({ embed });
  }
};
