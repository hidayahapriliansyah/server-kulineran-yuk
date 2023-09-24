import { Request } from 'express';
import * as DTO from './types';
import { Customer } from '@prisma/client';
import prisma from '../../../../db';
import { BadRequest, NotFound } from '../../../../errors';

const getAllWishlist = async (
  req: Request
): Promise<DTO.GetAllWishlist| Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>

  const foundWishlist = await prisma.wishlist.findMany({
    where: { customerId },
    include: {
      menu: {
        include: {
          restaurant: {
            select: {
              username: true,
              name: true,
            },
          },
        },
        select: {
          slug: true,
          name: true,
          image1: true,
        },
      },
    },
  });

  const countFoundWishlist = await prisma.wishlist.count({ where: { customerId }});

  const result: DTO.GetAllWishlist = {
    totalWishlist: countFoundWishlist,
    wishlistCollection: foundWishlist.map((wishlist) => ({
      id: wishlist.id,
      menu: {
        image: wishlist.menu.image1,
        name: wishlist.menu.name,
        slug: wishlist.menu.slug,
        restaurant: {
          username: wishlist.menu.restaurant.username,
          name: wishlist.menu.restaurant.name,
        },
      }
    })),
  };
  return result;
};

const addMenuToWishlist = async (
  req: Request
): Promise<DTO.WishlisResponse['id'] | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>

  const { menuId } = req.params;

  if (!menuId) {
    throw new BadRequest('menuId param is missing.');
  }

  const menuExist = await prisma.menu.findUnique({ where: { id: menuId }});
  if (!menuExist) {
    throw new NotFound('Menu is not found.');
  }

  const createdWishlist = await prisma.wishlist.create({
    data: { customerId, menuId },
  });
  return createdWishlist.id;
};

const isMenuInWishlist = async (
  req: Request
): Promise<boolean | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>

  const { menuId } = req.params;

  if (!menuId) {
    throw new BadRequest('menuId param is missing.');
  }

  const foundWishlist = await prisma.wishlist.findFirst({
    where: { customerId, menuId },
  });
  return foundWishlist ? true : false;
};

const removeMenuFromWishlist = async (
  req: Request
): Promise<DTO.WishlisResponse['id']  | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>

  const { menuId } = req.params;

  if (!menuId) {
    throw new BadRequest('menuId param is missing.');
  }
  
  const foundWishlist = await prisma.wishlist.findFirst({
    where: { customerId, menuId },
  });
  if (!foundWishlist) {
    throw new NotFound('Menu is not found.');
  }
  const removedWishlist = await prisma.wishlist.delete({
    where: { id: foundWishlist.id },
  });

  return removedWishlist.id;
};

export {
  getAllWishlist,
  addMenuToWishlist,
  isMenuInWishlist,
  removeMenuFromWishlist,
};
