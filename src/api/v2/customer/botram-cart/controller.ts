import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { SuccessAPIResponse } from '../../../../global/types';
import * as botramCartService from '../../../../services/prisma/customer/botram-cart';

const getBotramCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await botramCartService.getBotramCart(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Get cart only from my cart successfully.', {
        botramCart: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const addMenuToBotramCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await botramCartService.addMenuToBotramCart(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Add item to botram cart successfully.', {
        cartItemId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const getItemsByBotramGroup = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await botramCartService.getItemsByBotramGroup(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Get cart only from botram cart successfully.', {
        botramCart: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const updateQtyOfBotramCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await botramCartService.updateQtyOfBotramCartItem(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Updating quantity of botram cart item successfully.', result));
  } catch (error: any) {
    next(error);
  }
};

const deleteBotramCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await botramCartService.deleteBotramCartItem(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Delete item from botram cart successfully.', {
        botramCartId: result,
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
    const result = await botramCartService.itemBulkDeletion(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Removing many item from botram cart successfully.', {
        deletedItemCount: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

export {
  getBotramCart,
  addMenuToBotramCart,
  getItemsByBotramGroup,
  updateQtyOfBotramCartItem,
  deleteBotramCartItem,
  itemBulkDeletion,
};
