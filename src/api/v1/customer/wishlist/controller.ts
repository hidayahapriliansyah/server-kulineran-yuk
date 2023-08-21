import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SuccessAPIResponse } from '../../../../global/types';

import * as wishlistService from '../../../../services/mongoose/customer/wishlist';
import * as DTO from '../../../../services/mongoose/customer/wishlist/types';
import { boolean } from 'zod';

const getAllWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await wishlistService.getAllWishlist(req) as DTO.GetAllWishlist;

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Get restaurant profile data successfully', result));
  } catch (error: any) {
    next(error);
  }
};

const addMenuWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await wishlistService.addMenuToWishlist(req) as DTO.WishlisResponse['_id'];

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Adding menu to wishlist successfully', {
        wishlistId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const isMenuInWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await wishlistService.isMenuInWishlist(req) as boolean;

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Checking successfully', result));
  } catch (error: any) {
    next(error);
  }
};

const removeMenuFromWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await wishlistService.removeMenuFromWishlist(req) as DTO.WishlisResponse['_id'];

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Checking successfully', {
        wishlistId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

export {
  getAllWishlist,
  addMenuWishlist,
  isMenuInWishlist,
  removeMenuFromWishlist,
};