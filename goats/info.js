const embed = {
  title: "Yagi | Info",
  description:
    "Vulture's Vale and Blizzard Berg World Boss Timer For Aura Kingdom.\n[Invite Link](https://discordapp.com/oauth2/authori…)",
  color: 1493680,
  thumbnail: {
    url:
      "https://cdn.discordapp.com/attachments/491143568359030794/500863196471754762/goat-timer_logo_dark2.png"
  },
  fields: [
    {
      name: "List of Commands",
      value:
        "**+`info`** : Displays bot information.\n**+`invite`** : Generates invite link\n**+`goatsc`** : Displays upcoming world boss spawn in Chimera\n**+`goatsp`** : Displays upcoming world boss spawn in Phoenix\n**+`leads`** : Displays players who leads the hunt for world bosses\n**+`loot`** : Displays loot from world bosses"
    },
    {
      name: "Other AK Bots",
      value:
        "[Eternia]() - `Aura Kingdom Timers`\n[Amaterasu](https://discordapp.com/oauth2/authorize?&client_id=510980011008983060&scope=bot&permissions=8) - `Aura Kingdom Eidolons`\n"
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
