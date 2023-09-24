import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { SuccessAPIResponse } from '../../../../global/types';
import * as cartService from '../../../../services/prisma/customer/cart';

const getOverviewCartGrouped = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await cartService.getOverviewCartGrouped(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Get overview cart data successfully.', result));
  } catch (error: any) {
    next(error);
  }
}; 

export {
  getOverviewCartGrouped,
};
