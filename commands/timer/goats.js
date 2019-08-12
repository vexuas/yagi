const { api } = require('../../config.json');
const { google } = require('googleapis');
const sheets = google.sheets('v4');
const { format } = require('date-fns');

const getServerTime = function formatsLocalTimeToServerTime() {
  //Current Date with Time
  const localTime = new Date();
  //Current time in milliseconds
  const localTimeinMs = localTime.getTime();
  //Difference between your timezone and UTC in hours
  const localTimezoneOffset = localTime.getTimezoneOffset() / 60;
  /**
   * The above is just for context
   * If you're at UTC +8 timezone, the offset is UTC +0 minus UTC +8
   * Below is more on how to get what you need
   * Pretty much you'll just need the server's timezoneoffset
   * And use that to configure localTime
   */
  const serverTimezoneOffset = 4; //EDT offset
  const timezoneDifference = localTimezoneOffset - serverTimezoneOffset;
  const serverTime = localTimeinMs + timezoneDifference * 3600000; //serverTime in milliseconds

  return format(serverTime, 'ddd, hh:mm:ss A'); //To make it readable
};

const getSpreadSheetValues = function requestToExternalSpreadsheetAndReturnReadableData(
  callback
) {
  const authClient = api;

  if (authClient == null) {
    console.log('authentication failed');
    return;
  }
  callback(authClient);
};

module.exports = {
  name: 'goats',
  description: 'Olympus World Boss Time',
  execute(message) {
    getSpreadSheetValues(function(authClient) {
      message.channel.startTyping(); //Since it'll take a couple of seconds, I'll add this here
      //GET request to spreadsheet for values
      const request = {
        spreadsheetId: 'tUL0-Nn3Jx7e6uX3k4_yifQ',

        ranges: ['C4', 'C6', 'C8', 'E22', 'H22'],

        auth: authClient
      };

      sheets.spreadsheets.values.batchGet(request, function(err, response) {
        if (err) {
          console.error(err);
          return;
        }
        const rawSheetValues = response.data.valueRanges;
        /**
         * First Object: Location
         * Second Object: Last Spawn
         * Third Object: Next Spawn
         * Fourth Object: Banoleth Spawn
         * Fifth Object: Bisolen Spawn
         * Since the response returns values in an array within an array nested in an object,
         * the below extracts the actual data and pushes them in a new array
         * Then sets the value to its corresponding spreadsheetValues key
         */
        let actualSheetValues = [];
        rawSheetValues.forEach(item => {
          actualSheetValues.push(item.values[0][0]);
        });
        const spreadsheetValues = {
          location: actualSheetValues[0],
          lastSpawn: actualSheetValues[1],
          nextSpawn: actualSheetValues[2],
          banolethCount: actualSheetValues[3],
          bisolenCount: actualSheetValues[4]
        };
        message.channel.send(getServerTime());
        message.channel.send(spreadsheetValues.location);
        message.channel.stopTyping();
      });
    });
  }
};
