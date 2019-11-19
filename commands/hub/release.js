module.exports = {
  name: 'release',
  description: 'Displays the latest version information and changelog',
  execute(message) {
    const release = '```\n• Update server time due to daylight savings```';
    const embed = {
      description: `${message.author} | Latest Release: [v2.1.0](https://github.com/Vexuas/yagi/releases)\n${release}`,
      color: 32896
    };
    message.channel.send({ embed });
  }
};
