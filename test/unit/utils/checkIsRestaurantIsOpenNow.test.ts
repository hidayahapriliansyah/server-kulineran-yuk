import checkIsRestaurantOpenNow from '../../../src/utils/checkIsRestaurantOpenNow';

describe('test checkIsRestaurantOpenNow', () => {
  // should throw error if openingHour or closingHour format is not valid
  it('should throw error if openingHour or closingHour format is not valid', () => {
    expect(() => checkIsRestaurantOpenNow({
      openingHour: '2',
      closingHour: '0',
      daysoff: null,
    })).toThrowError();

    try {
      checkIsRestaurantOpenNow({
        openingHour: '2',
        closingHour: '0',
        daysoff: null,
      });
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Format waktu opening dan closing hour harus HH:mm');
    }
  });
  // should return false (i check it at 11 am)
  it('should return false (i check it at 11 am)', () => {
    const isOpenNow = checkIsRestaurantOpenNow({
      openingHour: '17:00',
      closingHour: '21:00',
      daysoff: null,
    });

    expect(isOpenNow).toBe(false);
  });
  it('should return false (i check it on saturday)', () => {
    const isOpenNow = checkIsRestaurantOpenNow({
      openingHour: '08:00',
      closingHour: '21:00',
      daysoff: ['saturday', 'sunday'],
    });

    expect(isOpenNow).toBe(false);
  });
  // should return true (i check it at 11 am)
  it('should return true (i check it at 11 am)', () => {
    const isOpenNow = checkIsRestaurantOpenNow({
      openingHour: '08:00',
      closingHour: '21:00',
      daysoff: null,
    });
    expect(isOpenNow).toBe(true);
  });
});