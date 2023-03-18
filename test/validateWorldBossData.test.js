const assert = require('assert');
const { validateWorldBossData } = require('../dist/utils/helpers');

describe('validateWorldBossData', function () {
  describe('when sheet is updated', function () {
    it('should return the correct nextSpawn data when server time is in the morning', function () {
      const worldBossData = {
        nextSpawn: '2:45:00 AM',
      };
      const serverTime = new Date('August 21, 2019 2:00:45 PM');
      const result = validateWorldBossData(worldBossData, serverTime);

      assert.strictEqual(result.nextSpawn, 'July 17, 2021 2:45:00 AM');
      assert.strictEqual(result.countdown, '44 mins 15 secs');
      assert.strictEqual(result.accurate, true);
    });
    it('should return the correct nextSpawn data when server time is in the afternoon', function () {
      const worldBossData = {
        nextSpawn: '3:45:00 PM',
      };
      const serverTime = new Date('August 21, 2019 2:00:45 PM');
      const result = validateWorldBossData(worldBossData, serverTime);

      assert.strictEqual(result.nextSpawn, 'July 17, 2021 3:45:00 PM');
      assert.strictEqual(result.countdown, '1 hr 44 mins 15 secs');
      assert.strictEqual(result.accurate, true);
    });
    it('should return the correct nextSpawn data when server time is in the evening', function () {
      const worldBossData = {
        nextSpawn: '8:45:00 PM',
      };
      const serverTime = new Date('August 21, 2019 2:00:45 PM');
      const result = validateWorldBossData(worldBossData, serverTime);

      assert.strictEqual(result.nextSpawn, 'July 17, 2021 8:45:00 PM');
      assert.strictEqual(result.countdown, '44 mins 15 secs');
      assert.strictEqual(result.accurate, true);
    });
    it('should return the correct nextSpawn data when server time is in the evening but next spawn is the next day', function () {
      const worldBossData = {
        nextSpawn: '1:45:00 AM',
      };
      const serverTime = new Date('August 21, 2019 2:00:45 PM');
      const result = validateWorldBossData(worldBossData, serverTime);

      assert.strictEqual(result.nextSpawn, 'July 18, 2021 1:45:00 AM');
      assert.strictEqual(result.countdown, '2 hrs 44 mins 15 secs');
      assert.strictEqual(result.accurate, true);
    });
  });
  describe('when sheet is not updated', function () {
    it('should return the approximate nextSpawn data when server time is in the early morning and sheet data is from previous day', function () {
      const wrongWorldBossData = {
        nextSpawn: '10:45:00 PM',
      };
      const serverTime = new Date('August 21, 2019 2:00:45 PM');
      const result = validateWorldBossData(wrongWorldBossData, serverTime);

      assert.strictEqual(result.nextSpawn, 'July 18, 2021 2:45:00 AM');
      assert.strictEqual(result.countdown, '1 hr 44 mins 15 secs');
      assert.strictEqual(result.accurate, false);
    });
    it('should return the approximate nextSpawn data when server time is in the morning', function () {
      const wrongWorldBossData = {
        nextSpawn: '4:45:00 AM',
      };
      const serverTime = new Date('August 21, 2019 2:00:45 PM');
      const result = validateWorldBossData(wrongWorldBossData, serverTime);

      assert.strictEqual(result.nextSpawn, 'July 18, 2021 8:45:00 AM');
      assert.strictEqual(result.countdown, '1 hr 44 mins 15 secs');
      assert.strictEqual(result.accurate, false);
    });
    it('should return the approximate nextSpawn data when server time is in the afternoon', function () {
      const wrongWorldBossData = {
        nextSpawn: '2:45:00 PM',
      };
      const serverTime = new Date('August 21, 2019 2:00:45 PM');
      const result = validateWorldBossData(wrongWorldBossData, serverTime);

      assert.strictEqual(result.nextSpawn, 'July 18, 2021 6:45:00 PM');
      assert.strictEqual(result.countdown, '1 hr 44 mins 15 secs');
      assert.strictEqual(result.accurate, false);
    });
    it('should return the approximate nextSpawn data when server time is in the evening', function () {
      const wrongWorldBossData = {
        nextSpawn: '9:45:00 PM',
      };
      const serverTime = new Date('August 21, 2019 2:00:45 PM');
      const result = validateWorldBossData(wrongWorldBossData, serverTime);

      assert.strictEqual(result.nextSpawn, 'July 19, 2021 1:45:00 AM');
      assert.strictEqual(result.countdown, '2 hrs 44 mins 15 secs');
      assert.strictEqual(result.accurate, false);
    });
  });
});
