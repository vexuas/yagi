import { format } from 'date-fns';
import { validateWorldBossData } from '../src/utils/helpers';

it('should return default nextSpawn and countdown values when in normal flow and updated sheet', function () {
  const normalWorldBossData = {
    location: '',
    lastSpawn: '',
    countdown: '',
    nextSpawn: '3:45:00 PM',
  };
  const serverTime = new Date('August 21, 2019 2:00:45 PM');
  const result = validateWorldBossData(normalWorldBossData, serverTime);

  expect(result).not.toBeUndefined();
  result && expect(format(new Date(result.nextSpawn), 'h:mm:ss a')).toBe('3:45:00 PM');
  result && expect(result.countdown).toBe('1 hr 44 mins 15 secs');
});
it('should return correct nextSpawn and countdown values when in late night flow and updated sheet', function () {
  const lateNightWorldBossData = {
    location: '',
    lastSpawn: '',
    countdown: '',
    nextSpawn: '1:45:00 AM',
  };
  const serverTime = new Date('August 21, 2019 11:00:45 PM');
  const result = validateWorldBossData(lateNightWorldBossData, serverTime);

  expect(result).not.toBeUndefined();
  result && expect(format(new Date(result.nextSpawn), 'h:mm:ss a')).toBe('1:45:00 AM');
  result && expect(result.countdown).toBe('2 hrs 44 mins 15 secs');
});
it('should return correct nextSpawn and countdown values when in normal flow and no editor updated sheet', function () {
  const normalNonUpdatedWorldBossData = {
    location: '',
    lastSpawn: '',
    countdown: '',
    nextSpawn: '3:45:00 PM',
  };
  const serverTime = new Date('August 21, 2019 5:00:45 PM');
  const result = validateWorldBossData(normalNonUpdatedWorldBossData, serverTime);

  expect(result).not.toBeUndefined();
  result && expect(format(new Date(result.nextSpawn), 'h:mm:ss a')).toBe('7:45:00 PM');
  result && expect(result.countdown).toBe('2 hrs 44 mins 15 secs');
});
it('should return correct nextSpawn and countdown values when in late night flow and no editor updated sheet', function () {
  const lateNightNonUpdatedWorldBossData = {
    location: '',
    lastSpawn: '',
    countdown: '',
    nextSpawn: '9:45:00 PM',
  };
  const serverTime = new Date('August 21, 2019 11:00:45 PM');
  const result = validateWorldBossData(lateNightNonUpdatedWorldBossData, serverTime);

  expect(result).not.toBeUndefined();
  result && expect(format(new Date(result.nextSpawn), 'h:mm:ss a')).toBe('1:45:00 AM');
  result && expect(result.countdown).toBe('2 hrs 44 mins 15 secs');
});
it('should return correct nextSpawn and countdown values when in late night flow and no editor updated sheet and serverTime has gone to next day', function () {
  const midNightNonUpdatedWorldBossData = {
    location: '',
    lastSpawn: '',
    countdown: '',
    nextSpawn: '9:45:00 PM',
  };
  const serverTime = new Date('August 22, 2019 1:00:45 AM');
  const result = validateWorldBossData(midNightNonUpdatedWorldBossData, serverTime);

  expect(result).not.toBeUndefined();
  result && expect(format(new Date(result.nextSpawn), 'h:mm:ss a')).toBe('1:45:00 AM');
  result && expect(result.countdown).toBe('44 mins 15 secs');
});
