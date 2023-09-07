import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { SuccessAPIResponse } from '../../../../global/types';
import * as orderService from '../../../../services/prisma/resto/orders';

const getCountOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await orderService.getCountOrder(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Getting count order data successfully.', result));
  } catch (error: any) {
    next(error);
  }
};

const getTodayOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await orderService.getTodayOrder(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Getting today order data successfully.', result));
  } catch (error: any) {
    next(error);
  }
};

const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await orderService.getAllOrders(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Getting order data successfully.', result));
  } catch (error: any) {
    next(error);
  }
};

const findOrderDetailByCustomerUsername = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await orderService.findOrderDetailByCustomerUsername(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Getting order data successfully.', result));
  } catch (error: any) {
    next(error);
  }
};

const getDetailOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await orderService.getDetailOrderById(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Getting order data successfully.', result));
  } catch (error: any) {
    next(error);
  }
};

const updateCustomerOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await orderService.updateCustomerOrderStatus(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Updating order status successfully.', {
        orderId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const updateCustomerOrderPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await orderService.updateCustomerOrderPaymentStatus(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Updating order payment status successfully.', {
        orderId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

export {
  getCountOrder,
  getTodayOrder,
  getAllOrders,
  getDetailOrderById,
  findOrderDetailByCustomerUsername,
  updateCustomerOrderStatus,
  updateCustomerOrderPaymentStatus,
};
