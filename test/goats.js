const assert = require('assert');
const { validateSpawn } = require('../commands/timer/goats');

describe('goats', function() {
  describe('validateSpawn', function() {
    it('should return default nextSpawn and countdown values when in normal flow and updated sheet', function() {
      const normalWorldBossData = {
        nextSpawn: '3:45:00 PM'
      };
      const serverTime = 'August 21, 2019 2:00:45 PM';

      const result = validateSpawn(normalWorldBossData, serverTime);

      assert.equal(result.nextSpawn, '3:45:00 PM');
      assert.equal(result.countdown, '1 hr 44 mins 15 secs');
    });

    it('should return correct nextSpawn and countdown values when in late night flow and updated sheet', function() {
      const lateNightWorldBossData = {
        nextSpawn: '1:45:00 AM'
      };
      const serverTime = 'August 21, 2019 11:00:45 PM';

      const result = validateSpawn(lateNightWorldBossData, serverTime);

      assert.equal(result.nextSpawn, '1:45:00 AM');
      assert.equal(result.countdown, '2 hrs 44 mins 15 secs');
    });

    it('should return correct nextSpawn and countdown values when in normal flow and no editor updated sheet', function() {
      const normalNonUpdatedWorldBossData = {
        nextSpawn: '3:45:00 PM'
      };
      const serverTime = 'August 21, 2019 5:00:45 PM';

      const result = validateSpawn(normalNonUpdatedWorldBossData, serverTime);

      assert.equal(result.nextSpawn, '7:45:00 PM');
      assert.equal(result.countdown, '2 hrs 44 mins 15 secs');
    });

    it('should return correct nextSpawn and countdown values when in late night flow and no editor updated sheet', function() {
      const lateNightNonUpdatedWorldBossData = {
        nextSpawn: '9:45:00 PM'
      };
      const serverTime = 'August 22, 2019 11:00:45 PM';

      const result = validateSpawn(lateNightNonUpdatedWorldBossData, serverTime);

      assert.equal(result.nextSpawn, '1:45:00 AM');
      assert.equal(result.countdown, '2 hrs 44 mins 15 secs');
    });
  });
});
