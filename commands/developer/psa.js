const { PSA, PSAmessage } = require('../../config/psa.json');

const setPSA = (message, messageInfo, show) => {
  if(show){
    const showMessage = PSA ? 'PSA is turned on' : 'PSA is turned off'
    
  }
  let psa;
  //Toggles PSA
  if(PSA){
    psa = false;
  } else {
    psa = true;
  }
  //Checks what message to show to user
  // if()
}

/**
 * Shows if PSA is activated
 */
const showPSA = (message) => {
  const showMessage = PSA ? 'PSA is turned on' : 'PSA is turned off';
  return message.channel.send(showMessage);
}

module.exports = {
  name: "psa",
  description: "Toggles a trigger that sends a public service announcement when using the timer. Only to be used in extreme cases where timer data is experiencing problems",
  devOnly: true,
  async execute(message) {
    if (message.author.id === '183444648360935424') {
      return showPSA(message);
      // return setPSA(message, 'Hello', true);
    }
    return;
  }
};
