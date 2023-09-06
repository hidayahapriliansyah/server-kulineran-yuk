import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { SuccessAPIResponse } from '../../../../global/types';
import * as orderService from '../../../../services/prisma/customer/orders';

const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await orderService.createOrder(req);

    res
      .status(StatusCodes.CREATED)
      .json(new SuccessAPIResponse('Creating order successfully.', {
        orderId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const getOrderList = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await orderService.getOrderList(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Get order list successfully.', {
        orderId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await orderService.getOrderById(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Getting order data successfully.', result));
  } catch (error: any) {
    next(error);
  }
};

const deleteUnprocessedOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await orderService.deleteUnprocessedOrder(req);

    res
      .status(StatusCodes.CREATED)
      .json(new SuccessAPIResponse('Removing order successfully.', {
        orderId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

export {
  createOrder,
  getOrderList,
  getOrderById,
  deleteUnprocessedOrder,
};
