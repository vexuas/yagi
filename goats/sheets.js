const embed = {
  title: "Public Sheets",
  description:
    "[Catalyst Sheet (Chimera)](https://tinyurl.com/catalyst-ak) | [Angel Sheet (Phoenix)](https://tinyurl.com/Angels-WB)",
  color: 32896
};

module.exports = {
  name: "sheets",
  description: "sheet link",
  execute(message, args) {
    message.channel.send({ embed });
  }
};
