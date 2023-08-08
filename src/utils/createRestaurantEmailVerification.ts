import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

import { IRestaurant } from '../models/Restaurant';
import RestaurantVerification from '../models/RestaurantVerification';

const createRestaurantEmailVerification = async ({
  restaurantId,
  restaurantEmail,
}: {
  restaurantId: IRestaurant['_id'],
  restaurantEmail: IRestaurant['email']
}): Promise<void> => {
  const now = dayjs();
  const expiredAt = now.add(10, 'minutes').toISOString();
  const uniqueString = uuidv4();

  await RestaurantVerification.create({
    restaurantId: restaurantId,
    email: restaurantEmail,
    uniqueString,
    expiredAt,
  });
};

export default createRestaurantEmailVerification;
