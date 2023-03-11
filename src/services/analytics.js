/**
 * User and event tracking for Yagi using Mixpanel
 * The one thing I struggled with post-launch in projects was getting feedback from users on how to better improve my apps
 * For the most part, I've just been asking around friends and friends of friends about them and as insightful it may be, it's still a hassle and manual to do
 * With automating tracking, I get a first-hand source of truth of user adoption
 * I do regret not implementing this right in the begininng but better late than never? It's been one hell of a learning experience anyway and I doubt I'll forget to add these in new projects
 * For reference: https://developer.mixpanel.com/docs/nodejs
 */
const sendMixpanelEvent = ({
  user,
  channel,
  guild,
  command,
  client,
  arguments,
  isApplicationCommand = true,
  properties,
}) => {
  const eventToSend = `Use ${command} command`; //Name of event; string interpolated with command as best to write an event as an action a user is doing
  /**
   * Creates and updates a user profile
   * Sets properties everytime event is called and overrides if they're different
   */
  client.people.set(user.id, {
    $name: user.username,
    $created: user.createdAt.toISOString(),
    tag: user.tag,
    guild: guild.name,
    guild_id: guild.id,
  });
  if (channel.type !== 'dm') {
    /**
     * Event to send to mixpanel
     * Added relevant properties along with event such as user, channel and guild
     * Important to always send `distinct_id` as mixpanel-nodejs uses this as its unique identifier
     */
    client.track(eventToSend, {
      distinct_id: user.id,
      user: user.tag,
      user_name: user.username,
      channel: channel.name,
      channel_id: channel.id,
      guild: guild.name,
      guild_id: guild.id,
      command: command,
      arguments: arguments ? arguments : 'none',
      isApplicationCommand: isApplicationCommand,
      ...properties,
    });
    /**
     * Sets a user profile properties only once
     * Gets called on every event but doesn't override property if it already exists
     * Useful for first time stuff
     */
    client.people.set_once(user.id, {
      first_used: new Date().toISOString(), //Unfortunately this is only after v2.5
      first_command: command,
      first_used_in_guild: guild.name,
      first_used_in_channel: channel.name,
    });
  } else {
    /**
     * Separate tracking for dms
     * Currently this is just to see if people actually message yagi privately instead of through a channel
     */
    client.track('Use command in private message', {
      distinct_id: user.id,
      user: user.tag,
      user_name: user.username,
    });
  }
};

module.exports = {
  sendMixpanelEvent,
};
