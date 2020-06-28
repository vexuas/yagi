module.exports = {
  name: 'release',
  description: 'Displays the latest version information and changelog',
  execute(message) {
    const release = '```\n• Revert server time`\n• Show current prefix when pinged``';
    const embed = {
      description: `${message.author} | Latest Release: [v2.1.1](https://github.com/Vexuas/yagi/releases)\n${release}`,
      color: 32896,
    };
    message.channel.send({ embed });
  },
};
