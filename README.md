<div align="center">
  <img src="https://cdn.discordapp.com/attachments/491143568359030794/500863196471754762/goat-timer_logo_dark2.png" width=120px/>
</div>

# yagi | v3.2.3 <br>Aura Kingdom EN World Boss Timer for Discord

Discord bot created for the MMORPG [Aura Kingdom](https://aurakingdom.aeriagames.com/). Its main
function is to give information of when the next spawn of the world bosses of Vulture's Vale and
Blizzard Berg will occur. Currently only supports the official English server.

<div align="center">
  <img src="https://user-images.githubusercontent.com/42207245/127074071-3b2cd5bc-29e5-4107-b7b4-8cebdfb9d00b.png" width=500px  />
</div>
  
As this is a player-driven raid, the source of data is also [player-driven](https://docs.google.com/spreadsheets/d/tUL0-Nn3Jx7e6uX3k4_yifQ/htmlview?pru=AAABetvDVTc*CUO1z4a8sJgbuqturEfCGQ#). Yagi is not intended to be a replacement; rather to offer a convenient way to players in getting this data. Shoutout to the Olympus world boss leads in working hard and keeping the sheet up-to-date. [New to the hunt? Click me!](https://aurakingdom.aeriagames.com/forum/index.php?thread/2817-info-the-olympus-world-boss-team/)

I started this project back in late 2018 not only because I was lazy in always opening a new browser
tab and checking a spreadsheet but primarily more to learn Javascript and kickstart my passion in
frontend development. And with how I did manage to start a career in this field, I like to think
that Yagi in all of its spaghetti code and voodoo in its earlier days played a big part of that.
This project will always have a special place in my heart and to whoever is reading this and using
Yagi, thanks a lot I really appreciate it! (◕ᴗ◕✿)

## Tech Stack

- [Discord.js](https://discord.js.org/#/) - Node.js module to interact easier with Discord's API
- [PostgreSQL](https://www.postgresql.org/) | [DigitalOcean](https://www.digitalocean.com/products/managed-databases) - Managed database to store server data
- [Mixpanel](https://mixpanel.com/) - user analytics tracker

## Commands List

Instead of prefixes, Yagi uses Discord's [Slash Commands](https://support.discord.com/hc/en-us/articles/1500000368501-Slash-Commands-FAQ) `/`

- `goats` - information for the next world boss spawn
- `about` - information hub of Yagi
- `help` - list of commands
- `invite` - generates Yagi's invite link
- `sheets` - information of current and past player data sheets
- `loot` - information of what a player can get from hunting these world bosses
- `remind` - personal reminder to notify you when world boss is soon - Temporary disabled as a better version is being developed

## Useful Links

- [Yagi Support Server](https://discord.gg/7nAYYDm)
- [Olympus WB Sheet](https://docs.google.com/spreadsheets/d/tUL0-Nn3Jx7e6uX3k4_yifQ/htmlview?pru=AAABetvDVTc*CUO1z4a8sJgbuqturEfCGQ#)
- [Guide for new WB hunters](https://aurakingdom.aeriagames.com/forum/index.php?thread/2817-info-the-olympus-world-boss-team/)

---
