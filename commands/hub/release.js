module.exports = {
  name: 'release',
  description: 'Displays the latest version information and changelog',
  execute(message) {
    const release = '```Tbh just a lot of internal updates. Gonna see if I can make this release command more efficient in the coming weeks```';
    const embed = {
      description: `${message.author} | Latest Release: [v2.3.0](https://github.com/Vexuas/yagi/releases)\n${release}`,
      color: 32896,
    };
    message.channel.send({ embed });
  },
};
