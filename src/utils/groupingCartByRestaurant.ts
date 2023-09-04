import _ from 'lodash';

import { Restaurant } from '@prisma/client';
import * as DTO from '../services/prisma/customer/cart/types';

const groupingCartByRestaurant = (
  cart: { restaurantId: Restaurant['id'], restaurant: Restaurant }[]
) => {
  const groupedData = _.groupBy(cart, 'restaurantId');
  const groupedMyCartByRestaurant = _.map(groupedData, (items) => {
    const restaurant = _.pick(items[0].restaurant, ['id', 'name', 'username', 'avatar']);
    const totalItem = items.length;
    return { restaurant, totalItem };
  }) as DTO.GroupedCartByRestaurant;
  return groupedMyCartByRestaurant;
};

export default groupingCartByRestaurant;