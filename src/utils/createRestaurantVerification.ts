import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

import { Restaurant, RestaurantVerification } from '@prisma/client';
import prisma from '../db';


const createRestaurantVerification = async ({
  restaurantId,
  restaurantEmail,
}: {
  restaurantId: Restaurant['id'],
  restaurantEmail: Restaurant['email'],
}): Promise<RestaurantVerification> => {
  const now = dayjs();
  const expiredAt = now.add(10, 'minutes').toISOString();
  const uniqueString = uuidv4();

  const result = await prisma.restaurantVerification.create({
    data: {
      restaurantId,
      email: restaurantEmail,
      expiredAt,
      uniqueString,
    },
  });
  
  return result; 
};

export default createRestaurantVerification;
