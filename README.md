<div align="center">
  <img src="https://cdn.discordapp.com/attachments/491143568359030794/500863196471754762/goat-timer_logo_dark2.png" width=120px/>
</div>

# yagi | v2.7.0 <br>Aura Kingdom EN World Boss Timer for Discord

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

- [Discord.js](https://discord.js.org/#/) - Node.js module to interact with Discord's API
- [Sqlite3](https://www.sqlite.org/index.html) - lightweight database to store server and user data
- [Mixpanel](https://mixpanel.com/) - user analytics tracker
- [Typeform](https://www.typeform.com/) - user feedback form

## Default Prefix

`$yagi-`

## How to use

1. [Invite Yagi](https://tinyurl.com/yagi-invite) to any of your discord servers
2. Once invited, type yagi's default prefix (`$yagi-`) with any of the commands below!

## Commands List

- `goats` - information for the next world boss spawn
- `info` - information hub of Yagi
- `help` - list of commands and how to use them
- `prefix` - shows current prefix
- `invite` - generates Yagi's invite link
- `sheets` - information of current and past player data sheets
- `loot` - information of what a player can get from hunting these world bosses
- `contacts` - information on where to contact lead owner and Yagi's support server
- `website` - web page of VV/BB world boss timer (Outdated)
- `feedback`- links of feedback form and Yagi's support server
- `remind` - personal reminder to notify you when world boss is soon
- `setprefix` - set custom prefix

## Setting up Reminders

Automatic notifications 10 minutes before every world boss spawn
<img src="https://user-images.githubusercontent.com/42207245/127486753-83a8bf4e-f86a-459b-8739-dda4338a3932.png" width=800px  />

- **Note before starting**:

  - There can only be one active reminder in one channel per server
  - Only users with Admin privileges can enable/disable reminders

- **Enabling Reminders**

  - Type `$yagi-remind enable` in the channel you want to get notifications from (e.g.
    #bot-reminders)
  - When reminder is succesfully enabled, yagi will send a reaction message
    <img src="https://user-images.githubusercontent.com/42207245/127491835-2eaa4ae2-6514-45ee-966d-dcadd42a750f.png" width=800px  />

- **Interactions**

  - When a reminder gets enabled, yagi creates a new role in the server called `@Goat Hunters`. This
    role will be used to ping you when world boss is soon. _Note that you can customise this role
    i.e. editing its name and color_
  - To get the `@Goat Hunters` role, react to the reaction message with :goat:
    <img src="https://user-images.githubusercontent.com/42207245/127494128-ca52b7dc-a35c-4698-aaa2-f718a3b94b9d.png" width=800px  />

        10 minutes before world boss spawns, Yagi will ping the role along with the world boss information

![yagi-remind-ping](https://user-images.githubusercontent.com/42207245/127495636-7c2e883c-8ec0-4732-befa-0cf9237a6047.gif)

    During world boss spawn, Yagi will edit the message to signify world boss has started

![yagi-ping-edit](https://user-images.githubusercontent.com/42207245/127496937-4b6ce328-907c-4622-a646-c2aec1edeb5c.gif)

    30 minutes after the first world boss spawn, Yagi will delete the message to signify world boss has ended

![yagi-ping-delete](https://user-images.githubusercontent.com/42207245/127497839-d74e84af-c8a0-4ae4-b583-b893520599e3.gif)

- **Disabling Reminders**
  - To opt out of getting pinged, simply remove your :goat: reaction from the reaction message
  - To disable the active reminder entirely, type `$yagi-remind disable` in the channel it was
    enabled in (e.g. #bot-reminders)
    <img src="https://user-images.githubusercontent.com/42207245/127498548-f1e7ff5e-69bd-402f-89cc-6f14b79996a9.png" width=800px  />

---

## Useful Links

- [Yagi Support Server](https://discord.gg/7nAYYDm)
- [Yagi Feedback Form](https://cyhmwysg8uq.typeform.com/to/szg4bUPU)
- [Olympus WB Sheet](https://docs.google.com/spreadsheets/d/tUL0-Nn3Jx7e6uX3k4_yifQ/htmlview?pru=AAABetvDVTc*CUO1z4a8sJgbuqturEfCGQ#)
- [Guide for new WB hunters](https://aurakingdom.aeriagames.com/forum/index.php?thread/2817-info-the-olympus-world-boss-team/)

---
