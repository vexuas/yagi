const assert = require('assert');
const { format } = require('date-fns');
const { validateWorldBossData } = require('../dist/utils/helpers');

it('should return default nextSpawn and countdown values when in normal flow and updated sheet', function () {
  const normalWorldBossData = {
    nextSpawn: '3:45:00 PM',
  };
  const serverTime = new Date('August 21, 2019 2:00:45 PM');

  const result = validateWorldBossData(normalWorldBossData, serverTime);

  assert.equal(format(new Date(result.nextSpawn), 'h:mm:ss a'), '3:45:00 PM');
  assert.equal(result.countdown, '1 hr 44 mins 15 secs');
});
it('should return correct nextSpawn and countdown values when in late night flow and updated sheet', function () {
  const lateNightWorldBossData = {
    nextSpawn: '1:45:00 AM',
  };
  const serverTime = new Date('August 21, 2019 11:00:45 PM');

  const result = validateWorldBossData(lateNightWorldBossData, serverTime);

  assert.equal(format(new Date(result.nextSpawn), 'h:mm:ss a'), '1:45:00 AM');
  assert.equal(result.countdown, '2 hrs 44 mins 15 secs');
});
it('should return correct nextSpawn and countdown values when in normal flow and no editor updated sheet', function () {
  const normalNonUpdatedWorldBossData = {
    nextSpawn: '3:45:00 PM',
  };
  const serverTime = new Date('August 21, 2019 5:00:45 PM');

  const result = validateWorldBossData(normalNonUpdatedWorldBossData, serverTime);

  assert.equal(format(new Date(result.nextSpawn), 'h:mm:ss a'), '7:45:00 PM');
  assert.equal(result.countdown, '2 hrs 44 mins 15 secs');
});
it('should return correct nextSpawn and countdown values when in late night flow and no editor updated sheet', function () {
  const lateNightNonUpdatedWorldBossData = {
    nextSpawn: '9:45:00 PM',
  };
  const serverTime = new Date('August 21, 2019 11:00:45 PM');

  const result = validateWorldBossData(lateNightNonUpdatedWorldBossData, serverTime);

  assert.equal(format(new Date(result.nextSpawn), 'h:mm:ss a'), '1:45:00 AM');
  assert.equal(result.countdown, '2 hrs 44 mins 15 secs');
});
it('should return correct nextSpawn and countdown values when in late night flow and no editor updated sheet and serverTime has gone to next day', function () {
  const midNightNonUpdatedWorldBossData = {
    nextSpawn: '9:45:00 PM',
  };
  const serverTime = new Date('August 22, 2019 1:00:45 AM');

  const result = validateWorldBossData(midNightNonUpdatedWorldBossData, serverTime);

  assert.equal(format(new Date(result.nextSpawn), 'h:mm:ss a'), '1:45:00 AM');
  assert.equal(result.countdown, '44 mins 15 secs');
});
