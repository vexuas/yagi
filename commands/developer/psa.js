const { PSA, PSAmessage } = require('../../config/psa.json');
const fs = require('fs');

const defaultMessage = "Oopsie!"

const startPSA = (message, messageInfo) => {
  let psa;
  //Checks what message to show to user
  // if()
}

const stopPSA = (message) => {
  if(!PSA){
    return message.channel.send('PSA is already turned off');
  }
  const updatedPSAInfo = {
    PSA: false,
    PSAmessage: defaultMessage
  }
  fs.writeFile('./config/psa.json', JSON.stringify(updatedPSAInfo, null, 2), function (err) {
    if (err) {
      return console.log(err);
    }
    return message.channel.send('Turned off PSA');
  });
}
/**
 * Shows if PSA is activated
 **/
const showPSA = (message) => {
  const showMessage = PSA ? 'PSA is turned on' : 'PSA is turned off';
  return message.channel.send(showMessage);
}

// const generateEmbed = (type) => {
//   if(type){

//   }
//   const embed = {
//     color: 32896,
//     fields: [
//       {
//         name: 'PSA',
//         value: PSA ? 'on' : 'off'
//       },
//       {
//         name: 'PSA Message',
//         value: PSAmessage
//       }
//     ]
//   }
//   return embed;
// }
module.exports = {
  name: "psa",
  description: "Toggles a trigger that sends a public service announcement when using the timer. Only to be used in extreme cases where timer data is experiencing problems",
  devOnly: true,
  async execute(message) {
    if (message.author.id === '183444648360935424') {
      return stopPSA(message);
      // return setPSA(message, 'Hello', true);
    }
    return;
  }
};
