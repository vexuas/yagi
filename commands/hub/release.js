module.exports = {
  name: 'release',
  description: 'Displays the latest version information and changelog',
  execute(message) {
    const release =
      "```v2 has been released! Such a big change so can't write it here :c Do check out the offical release notes though!```";
    const embed = {
      description: `${
        message.author
      } | Latest Release: [v2.0.1](https://github.com/Vexuas/yagi/releases)\n${release}`,
      color: 32896
    };
    message.channel.send({ embed });
  }
};
