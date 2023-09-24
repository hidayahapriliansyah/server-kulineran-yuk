import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import updateLocale from 'dayjs/plugin/updateLocale';

dayjs.extend(isBetween);
dayjs.extend(updateLocale);
dayjs.updateLocale('en', {
  weekdays: [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  ],
});

const checkRestaurantIsOpenNow = ({ openingHour, closingHour, daysoff }: {
  openingHour: string,
  closingHour: string,
  daysoff: string[] | null,
}): boolean | Error => {
  try {
    const todayName = dayjs().format('dddd');
    if (daysoff) {
      if (daysoff.includes(todayName)) {
        return false;
      }
    }

    const regex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regex.test(openingHour) || !regex.test(closingHour)) {
      throw new Error('Format waktu opening dan closing hour harus HH:mm');
    }

    // hari sekarang dimulai 00:00 ditambahin jam buka dan tutup
    const now = dayjs();
    const today = now.startOf('day');
    const openingTimeToday = today
      .add(Number(openingHour.split(':')[0]), 'hours')
      .add(Number(openingHour.split(':')[1]), 'minutes');
    const closingTimeToday = today
      .add(Number(closingHour.split(':')[0]), 'hours')
      .add(Number(closingHour.split(':')[1]), 'minutes');
  
    const isOpenNow = now.isBetween(openingTimeToday, closingTimeToday);
    return isOpenNow;
  } catch (error: any) {
    throw error;
  }
};

export default checkRestaurantIsOpenNow;
