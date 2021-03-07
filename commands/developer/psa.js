const { PSA, PSAmessage } = require('../../config/psa.json');
const fs = require('fs');

const defaultMessage = "Oopsie!"

/**
 * Shows if PSA is activated
 */
const showPSA = (message) => {
  const embed = generateEmbed('show');
  return message.channel.send({ embed });
}
//-----
/**
 * Turns on the PSA
 * This would send the PSA message when users try to use the goat timer
 * @param {string} customPSA - optional message if you want to change the message of the PSA
 */
const startPSA = (message, customPSA) => {
  if(PSA){
    const embed = generateEmbed('start', 'PSA is already turned on!');
    return message.channel.send({ embed });
  }
  const updatedPSAInfo = {
    PSA: true,
    PSAmessage: customPSA ? customPSA : defaultMessage
  }

  fs.writeFile('./config/psa.json', JSON.stringify(updatedPSAInfo, null, 2), function (err) {
    if (err) {
      return console.log(err);
    }
    const embed = generateEmbed('start', null, updatedPSAInfo);
    message.channel.send({ embed });
  });
}
//-----
/**
 * Turns off PSA
 * Also switches the message back to the default one
 */
const stopPSA = (message) => {
  if(!PSA){
    const embed = generateEmbed('stop', 'PSA is already turned off!');
    return message.channel.send({ embed });
  }
  const updatedPSAInfo = {
    PSA: false,
    PSAmessage: defaultMessage
  }

  fs.writeFile('./config/psa.json', JSON.stringify(updatedPSAInfo, null, 2), function (err) {
    if (err) {
      return console.log(err);
    }
    const embed = generateEmbed('stop', null, updatedPSAInfo);
    message.channel.send({ embed });
  });
}
//-----
/**
 * Reusable embed to use for this command
 * @param {string} type - whether argument is show, start, stop
 * @param {string} descriptionInfo - if we want to add a custom description
 * @param {object} updatedInfo - additional updated info to display
 */
const generateEmbed = (type, descriptionInfo, updatedInfo) => {
  let description;
  const PSAtext = PSA ? 'On' : 'Off';
  const updatedPSAtext = updatedInfo && updatedInfo.PSA ? 'On' : 'Off';

  switch(type){
    case 'show':
      description = PSA ? 'PSA is turned on' : 'PSA is turned off';
      break;
    case 'stop':
      description = descriptionInfo ? descriptionInfo : 'Turned off PSA!';
      break;
    case 'start':
      description = descriptionInfo ? descriptionInfo : 'Turned on PSA!';
      break;
  }
  const embed = {
    description,
    color: 32896,
    fields: [
      {
        name: 'PSA',
        value: updatedInfo ? updatedPSAtext : PSAtext
      },
      {
        name: 'PSA Message',
        value: updatedInfo && updatedInfo.PSAmessage ? updatedInfo.PSAmessage : PSAmessage
      }
    ]
  }
  return embed;
}
module.exports = {
  name: "psa",
  description: "Toggles a trigger that sends a public service announcement when using the timer. Only to be used in extreme cases where timer data is experiencing problems",
  devOnly: true,
  async execute(message) {
    if (message.author.id === '183444648360935424') {
      return startPSA(message, 'Lets gooo');
      // return setPSA(message, 'Hello', true);
    }
    return;
  }
};
