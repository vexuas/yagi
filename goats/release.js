module.exports = {
  name: "release",
  description: "latest release information",
  execute(message, args) {
    const release = "```• Added $release command\n• Added $contacts command```";
    const embed = {
      description: `${
        message.author
      } | Latest Release: [v1.3](https://github.com/Vexuas/yagi/releases)\n${release}`,
      color: 32896
    };
    message.channel.send({ embed });
  }
};
