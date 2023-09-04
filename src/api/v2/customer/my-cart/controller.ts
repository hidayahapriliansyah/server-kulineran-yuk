import { NextFunction, Request, Response, json } from 'express';
import { StatusCodes } from 'http-status-codes';

import { SuccessAPIResponse } from '../../../../global/types';
import * as myCartService from '../../../../services/prisma/customer/my-cart';

const getMyCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await myCartService.getMyCart(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Get cart only from my cart successfully.', result));
  } catch (error: any) {
    next(error);
  }
};

const addMenuToMyCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await myCartService.addMenuToMyCart(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Add item to cart successfully.', {
        cartItemId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const getItemsByRestaurant = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await myCartService.getItemsByRestaurant(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Get cart only from my cart successfully.', result));
  } catch (error: any) {
    next(error);
  }
};

const updateQtyOfMyCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await myCartService.updateQtyOfMyCartItem(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Get cart only from my cart successfully.', result));
  } catch (error: any) {
    next(error);
  }
};

const deleteMyCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await myCartService.deleteMyCartItem(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Delete item from cart successfully.', {
        cartItemId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const itemBulkDeletion = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await myCartService.itemBulkDeletion(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Removing many item from my cart successfully.', {
        deletedItemCount: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

export {
  getMyCart,
  addMenuToMyCart,
  getItemsByRestaurant,
  updateQtyOfMyCartItem,
  deleteMyCartItem,
  itemBulkDeletion,
};
