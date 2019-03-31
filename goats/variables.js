const weekday = new Array(7);
weekday[0] = "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";

const maps = {
  V1: "Vulture's Vale Ch.1 (X:161, Y:784)",
  V2: "Vulture's Vale Ch.2 (X:161, Y:784)",
  V3: "Vulture's Vale Ch.3 (X:161, Y:784)",
  V4: "Vulture's Vale Ch.4 (X:161, Y:784)",
  V5: "Vulture's Vale Ch.5 (X:161, Y:784)",
  V6: "Vulture's Vale Ch.6 (X:161, Y:784)",
  V7: "Vulture's Vale Ch.7 (X:161, Y:784)",
  V8: "Vulture's Vale Ch.8 (X:161, Y:784)",
  B1: "Blizzard Berg Ch.1 (X:264, Y:743)",
  B2: "Blizzard Berg Ch.2 (X:264, Y:743)",
  B3: "Blizzard Berg Ch.3 (X:264, Y:743)",
  B4: "Blizzard Berg Ch.4 (X:264, Y:743)",
  B5: "Blizzard Berg Ch.5 (X:264, Y:743)",
  B6: "Blizzard Berg Ch.6 (X:264, Y:743)",
  B7: "Blizzard Berg Ch.7 (X:264, Y:743)",
  B8: "Blizzard Berg Ch.8 (X:264, Y:743)"
};
const phoemaps = {
  VV1: "V1",
  VV2: "V2",
  VV3: "V3",
  VV4: "V4",
  VV5: "V5",
  VV6: "V6",
  VV7: "V7",
  VV8: "V8",
  BB1: "B1",
  BB2: "B2",
  BB3: "B3",
  BB4: "B4",
  BB5: "B5",
  BB6: "B6",
  BB7: "B7",
  BB8: "B8"
};
const ampm = {
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  "11": 11,
  "12": 12,
  "13": 1,
  "14": 2,
  "15": 3,
  "16": 4,
  "17": 5,
  "18": 6,
  "19": 7,
  "20": 8,
  "21": 9,
  "22": 10,
  "23": 11,
  "24": 0
};

module.exports = {
  weekday: weekday,
  maps: maps,
  phoemaps: phoemaps,
  ampm: ampm
};
