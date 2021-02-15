module.exports = {
  name: 'release',
  description: 'Displays the latest version information and changelog',
  execute(message) {
    const release = '```Add temporary warning when using the prefix command```';
    const embed = {
      description: `${message.author} | Latest Release: [v2.3.1](https://github.com/Vexuas/yagi/releases)\n${release}`,
      color: 32896,
    };
    message.channel.send({ embed });
  },
};
