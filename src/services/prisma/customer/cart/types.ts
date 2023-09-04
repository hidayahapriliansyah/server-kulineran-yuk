import { BotramGroup, Restaurant } from '@prisma/client';

type GroupedCartByRestaurant = {
  restaurant: {
    id: Restaurant['id'],
    username: Restaurant['username'],
    name: Restaurant['name'],
    image: Restaurant['avatar'],
  },
  totalItem: number,
}[] | [];

type GetOverviewCartGroupedResponse = {
  mycart: {
    restaurantCount: number,
    cart: GroupedCartByRestaurant,
  },
  botramcart: {
    botramGroup: {
      name: BotramGroup['name'],
      resturant: {
        id: Restaurant['name'],
        username: Restaurant['username'],
        name: Restaurant['name'],
        image: Restaurant['avatar'],
      },
    },
    totalCartItem: number,
  } | null,
};

export {
  GroupedCartByRestaurant,
  GetOverviewCartGroupedResponse,
};
