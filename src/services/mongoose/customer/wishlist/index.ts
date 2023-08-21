import { Request } from 'express';

import * as DTO from './types';
import { ICustomer } from '../../../../models/Customer';
import Wishlist from '../../../../models/Wishlist';
import Menu, { IMenu } from '../../../../models/Menu';
import { IRestaurant } from '../../../../models/Restaurant';
import { BadRequest, NotFound } from '../../../../errors';

const getAllWishlist = async (req: Request):
  Promise<DTO.GetAllWishlist| Error> => {
    const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'email'>
    try {
      const foundWishlist = await Wishlist.find({ customerId })
        .populate({
          path: 'menuId',
          select: 'slug name image1 restaurantId',
          populate: {
            path: 'restaurantId',
            select: 'username name',
          }
        });

      const countFoundWishlist = await Wishlist.countDocuments({ customerId });

      const result: DTO.GetAllWishlist = {
        totalWishlist: countFoundWishlist,
        wishlistCollection: foundWishlist.map((wishlist) => ({
          _id: wishlist._id,
          menu: {
            image: (wishlist.menuId as IMenu)?.image1,
            name: (wishlist.menuId as IMenu)?.name,
            slug: (wishlist.menuId as IMenu)?.slug,
            restaurant: {
              name: ((wishlist.menuId as IMenu)?.restaurantId as IRestaurant)?.name,
              username: ((wishlist.menuId as IMenu)?.restaurantId as IRestaurant)?.username,
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
  Promise<DTO.WishlisResponse['_id'] | Error> => {
    const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'email'>
    try {
      const { menuId } = req.params;

      if (!menuId) {
        throw new BadRequest('Invalid Request. menuId param is missing. Please check your input data.');
      }

      const menuExist = await Menu.findById(menuId);
      if (!menuExist) {
        throw new NotFound('Menu ID not found, please input valid menu id.');
      }

      const createdWishlist = await Wishlist.create({ customerId, menuId });
      const { _id: result } = createdWishlist;
      return result;
    } catch (error: any) {
      if (error.name === 'CastError') {
        throw new NotFound('Menu ID not found, please input valid menu id.');
      }
      throw error;
    }
  };

const isMenuInWishlist = async (req: Request):
  Promise<boolean | Error> => {
    const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'email'>
    try {
      const { menuId } = req.params;

      if (!menuId) {
        throw new BadRequest('Invalid Request. menuId param is missing. Please check your input data.');
      }

      const foundWishlist = await Wishlist.findOne({ customerId, menuId });
      return foundWishlist ? true : false;
    } catch (error: any) {
      if (error.name === 'CastError') {
        return false;
      }
      throw error;
    }
  };

const removeMenuFromWishlist = async (req: Request):
  Promise<DTO.WishlisResponse['_id']  | Error> => {
    const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'email'>
    try {
      const { menuId } = req.params;

      if (!menuId) {
        throw new BadRequest('Invalid Request. menuId param is missing. Please check your input data.');
      }
      
      const removedWishlist = await Wishlist.findOneAndDelete({ customerId, menuId });
      if (!removedWishlist) {
        throw new NotFound('Menu ID not found, please input valid menu id.');
      }

      const { _id: result } = removedWishlist;
      return result;
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
