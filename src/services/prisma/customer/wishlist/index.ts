import { Request } from 'express';
import * as DTO from './types';
import { Customer } from '@prisma/client';
import prisma from '../../../../db';
import { BadRequest, NotFound } from '../../../../errors';

const getAllWishlist = async (req: Request):
  Promise<DTO.GetAllWishlist| Error> => {
    const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>
    try {
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
    } catch (error: any) {
      throw error;
    }
  };

const addMenuToWishlist = async (req: Request):
  Promise<DTO.WishlisResponse['id'] | Error> => {
    const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>
    try {
      const { menuId } = req.params;

      if (!menuId) {
        throw new BadRequest('Invalid Request. menuId param is missing. Please check your input data.');
      }

      const menuExist = await prisma.menu.findUnique({ where: { id: menuId }});
      if (!menuExist) {
        throw new NotFound('Menu ID not found, please input valid menu id.');
      }

      const createdWishlist = await prisma.wishlist.create({
        data: { customerId, menuId },
      });
      return createdWishlist.id;
    } catch (error: any) {
      throw error;
    }
  };

const isMenuInWishlist = async (req: Request):
  Promise<boolean | Error> => {
    const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>
    try {
      const { menuId } = req.params;

      if (!menuId) {
        throw new BadRequest('Invalid Request. menuId param is missing. Please check your input data.');
      }

      const foundWishlist = await prisma.wishlist.findFirst({
        where: { customerId, menuId },
      });
      return foundWishlist ? true : false;
    } catch (error: any) {
      if (error.name === 'CastError') {
        return false;
      }
      throw error;
    }
  };

const removeMenuFromWishlist = async (req: Request):
  Promise<DTO.WishlisResponse['id']  | Error> => {
    const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>
    try {
      const { menuId } = req.params;

      if (!menuId) {
        throw new BadRequest('Invalid Request. menuId param is missing. Please check your input data.');
      }
      
      const foundWishlist = await prisma.wishlist.findFirst({
        where: { customerId, menuId },
      });
      if (!foundWishlist) {
        throw new NotFound('Menu ID not found, please input valid menu id.');
      }
      const removedWishlist = await prisma.wishlist.delete({
        where: { id: foundWishlist.id },
      });

      return removedWishlist.id;
    } catch (error: any) {
      if (error.name === 'CastError') {
        throw new NotFound('Menu ID not found, please input valid menu id.');
      }
      throw error;
    }
  };

export {
  getAllWishlist,
  addMenuToWishlist,
  isMenuInWishlist,
  removeMenuFromWishlist,
};
