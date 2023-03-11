const { sendErrorLog } = require('../../utils/helpers');

module.exports = ({ yagi }) => {
  yagi.on('error', (error) => {
    sendErrorLog(yagi, error);
  });
};
