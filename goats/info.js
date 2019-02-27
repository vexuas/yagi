const embed = {
  title: "Yagi | Info",
  description:
    "Vulture's Vale and Blizzard Berg World Boss Timer For Aura Kingdom. Credits to leads and editors for the up-to-date times.\n[Catalyst Sheet (Chimera)](https://tinyurl.com/catalyst-ak) | [Angel Sheet (Phoenix)](https://tinyurl.com/Angels-WB)",
  color: 32896,
  thumbnail: {
    url:
      "https://cdn.discordapp.com/attachments/491143568359030794/500863196471754762/goat-timer_logo_dark2.png"
  },
  fields: [
    {
      name: "List of Commands",
      value:
        "**+`info`** : Displays bot information.\n**+`invite`** : Generates invite link\n**+`goatsc`** : Displays upcoming world boss spawn in Chimera\n**+`goatsp`** : Displays upcoming world boss spawn in Phoenix\n**+`loot`** : Displays loot from world bosses\n**+`sheets`** : Displays timer sheets of servers\n**+`remind`** : Displays reminder functions"
    },
    {
      name: "Bot Links",
      value:
        "[Yagi](https://tinyurl.com/ak-goats-bot) - `Aura Kingdom Goats`\n[Eternia]() - `Aura Kingdom Timers`\n[Amaterasu](https://tinyurl.com/ak-eidolons-bot) - `Aura Kingdom Eidolons`\n"
    }
  ]
};
module.exports = {
  name: "info",
  description: "bot information",
  execute(message, args) {
    message.channel.send({ embed });
  }
};
