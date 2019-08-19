const embed = {
  color: 32896,
  thumbnail: {
    url: 'http://cdn.aurakingdom-db.com/images/icons/I00025.jpg'
  },
  footer: {
    text: 'Opening the chest gives a chance in obtaining any one of these items'
  },
  fields: [
    {
      name: 'Loot | BattleFront Merit Chest',
      value:
        "• Hidden Demon's Hood\n• Baphomet's Assault Armor\n• Demon's Fortified Warhelm\n• Bisolen's Bulwark Armor\n• Healing Potion (Non-Tradable)\n• Secret Stone Randomizer (Non-Tradable)\n• Treasure Charm (Non-Tradable)\n• 50 Loyalty Points (Non-Tradable)\n• Aura Kingdom Coupon: 2000 Points\n• Banoleth Scythe\n• King Banoleth Scythe"
    }
  ]
};

module.exports = {
  name: 'loot',
  description: 'loot list',
  execute(message) {
    message.channel.send({ embed });
  }
};
