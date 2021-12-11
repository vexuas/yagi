module.exports = {
  name: 'release',
  description: 'Displays the latest version information and changelog',
  execute(message) {
    const release = '```You can now set a custom prefix!``';
    const embed = {
      description: `${message.author} | Latest Release: [v2.7.0](https://github.com/Vexuas/yagi/releases)\n${release}`,
      color: 32896,
    };
    message.channel.send({ embed });
  },
};
