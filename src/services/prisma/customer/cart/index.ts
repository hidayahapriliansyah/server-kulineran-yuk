import { Request } from 'express';
import _ from 'lodash';

import { Customer } from '@prisma/client';
import prisma from '../../../../db';
import groupingCartByRestaurant from '../../../../utils/groupingCartByRestaurant';
import * as DTO from './types';

const getOverviewCartGrouped = async (req: Request)
  :Promise<DTO.GetOverviewCartGroupedResponse | Error> => {
    const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;

    const menuCart = await prisma.menuCart.findMany({
      where: { customerId },
      include: {
        restaurant: true,
      },
    });
    const customMenuCart = await prisma.customMenuCart.findMany({
      where: { customerId },
      include: {
        restaurant: true,
      }
    });

    const allOfMyCart = [...menuCart, ...customMenuCart];
    const myCart = groupingCartByRestaurant(allOfMyCart);

    const botramGroupMembership = await prisma.botramGroupMember.findFirst({
      where: { customerId, status: 'ORDERING' },
      include: {
        botramGroup: {
          include: {
            restaurant: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        botramGroupMenuCarts: true,
        botramGroupCustomMenuCarts: true,
      }
    });
    const botramMenuCarts = botramGroupMembership?.botramGroupMenuCarts ?? [];
    const botramCustomMenuCarts = botramGroupMembership?.botramGroupCustomMenuCarts ?? [];
    const allOfBotramCart = [ ...botramMenuCarts, ...botramCustomMenuCarts ];

    const result: DTO.GetOverviewCartGroupedResponse = {
      mycart: {
        restaurantCount: myCart.length,
        cart: myCart,
      },
      botramcart: botramGroupMembership
        ? {
          botramGroup: {
            name: botramGroupMembership.botramGroup.name,
            resturant: {
              id: botramGroupMembership.botramGroup.restaurantId,
              username: botramGroupMembership.botramGroup.restaurant.username,
              name: botramGroupMembership.botramGroup.restaurant.name,
              image: botramGroupMembership.botramGroup.restaurant.avatar,
            }
          },
          totalCartItem: allOfBotramCart.length,
        }
        : null,
    };
    return result;
  };

export {
  getOverviewCartGrouped,
};
