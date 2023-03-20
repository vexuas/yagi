import { validateWorldBossData } from './helpers';

describe('validateWorldBossData', () => {
  describe('when sheet is updated', () => {
    it('should return the correct nextSpawn data when server time is in the morning', function () {
      const worldBossData = {
        location: '',
        lastSpawn: '',
        countdown: '',
        nextSpawn: '2:45:00 AM',
      };
      const serverTime = new Date('July 17 2021 2:00:45 AM');
      const result = validateWorldBossData(worldBossData, serverTime);

      expect(result).not.toBeUndefined();
      if (result) {
        expect(result.nextSpawn).toBe('July 17 2021 2:45:00 AM');
        expect(result.countdown).toBe('44 mins 15 secs');
        expect(result.accurate).toBeTruthy();
      }
    });
    it('should return the correct nextSpawn data when server time is in the afternoon', function () {
      const worldBossData = {
        location: '',
        lastSpawn: '',
        countdown: '',
        nextSpawn: '3:45:00 PM',
      };
      const serverTime = new Date('July 17 2021 2:00:45 PM');
      const result = validateWorldBossData(worldBossData, serverTime);

      expect(result).not.toBeUndefined();
      if (result) {
        expect(result.nextSpawn).toBe('July 17 2021 3:45:00 PM');
        expect(result.countdown).toBe('1 hr 44 mins 15 secs');
        expect(result.accurate).toBeTruthy();
      }
    });
    it('should return the correct nextSpawn data when server time is in the evening', function () {
      const worldBossData = {
        location: '',
        lastSpawn: '',
        countdown: '',
        nextSpawn: '8:45:00 PM',
      };
      const serverTime = new Date('July 17 2021 8:00:45 PM');
      const result = validateWorldBossData(worldBossData, serverTime);

      expect(result).not.toBeUndefined();
      if (result) {
        expect(result.nextSpawn).toBe('July 17 2021 8:45:00 PM');
        expect(result.countdown).toBe('44 mins 15 secs');
        expect(result.accurate).toBeTruthy();
      }
    });
    it('should return the correct nextSpawn data when server time is in the evening but next spawn is the next day', function () {
      const worldBossData = {
        location: '',
        lastSpawn: '',
        countdown: '',
        nextSpawn: '1:45:00 AM',
      };
      const serverTime = new Date('July 17 2021 11:00:45 PM');
      const result = validateWorldBossData(worldBossData, serverTime);

      expect(result).not.toBeUndefined();
      if (result) {
        expect(result.nextSpawn).toBe('July 18 2021 1:45:00 AM');
        expect(result.countdown).toBe('2 hrs 44 mins 15 secs');
        expect(result.accurate).toBeTruthy();
      }
    });
  });
  describe('when sheet is not updated', () => {
    it('should return the approximate nextSpawn data when server time is in the early morning and sheet data is from previous day', function () {
      const wrongWorldBossData = {
        location: '',
        lastSpawn: '',
        countdown: '',
        nextSpawn: '10:45:00 PM',
      };
      const serverTime = new Date('July 18 2021 1:00:45 AM');
      const result = validateWorldBossData(wrongWorldBossData, serverTime);

      expect(result).not.toBeUndefined();
      if (result) {
        expect(result.nextSpawn).toBe('July 18 2021 2:45:00 AM');
        expect(result.countdown).toBe('1 hr 44 mins 15 secs');
        expect(result.accurate).toBeFalsy();
      }
    });
    it('should return the approximate nextSpawn data when server time is in the morning', function () {
      const wrongWorldBossData = {
        location: '',
        lastSpawn: '',
        countdown: '',
        nextSpawn: '4:45:00 AM',
      };
      const serverTime = new Date('July 18 2021 7:00:45 AM');
      const result = validateWorldBossData(wrongWorldBossData, serverTime);

      expect(result).not.toBeUndefined();
      if (result) {
        expect(result.nextSpawn).toBe('July 18 2021 8:45:00 AM');
        expect(result.countdown).toBe('1 hr 44 mins 15 secs');
        expect(result.accurate).toBeFalsy();
      }
    });
    it('should return the approximate nextSpawn data when server time is in the afternoon', function () {
      const wrongWorldBossData = {
        location: '',
        lastSpawn: '',
        countdown: '',
        nextSpawn: '2:45:00 PM',
      };
      const serverTime = new Date('July 18 2021 5:00:45 PM');
      const result = validateWorldBossData(wrongWorldBossData, serverTime);

      expect(result).not.toBeUndefined();
      if (result) {
        expect(result.nextSpawn).toBe('July 18 2021 6:45:00 PM');
        expect(result.countdown).toBe('1 hr 44 mins 15 secs');
        expect(result.accurate).toBeFalsy();
      }
    });
    it('should return the approximate nextSpawn data when server time is in the evening', function () {
      const wrongWorldBossData = {
        location: '',
        lastSpawn: '',
        countdown: '',
        nextSpawn: '9:45:00 PM',
      };
      const serverTime = new Date('July 18 2021 11:00:45 PM');
      const result = validateWorldBossData(wrongWorldBossData, serverTime);

      expect(result).not.toBeUndefined();
      if (result) {
        expect(result.nextSpawn).toBe('July 19 2021 1:45:00 AM');
        expect(result.countdown).toBe('2 hrs 44 mins 15 secs');
        expect(result.accurate).toBeFalsy();
      }
    });
  });
});
