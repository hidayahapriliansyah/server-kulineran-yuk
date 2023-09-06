import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

import { SuccessAPIResponse } from '../../../../global/types';
import * as purchaseService from '../../../../services/prisma/customer/purchase';

const getPurchase = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await purchaseService.getPurchase(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Getting purchase data successfully.', result));
  } catch (error: any) {
    next(error);
  }
};

export {
  getPurchase,
};
