import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

import { SuccessAPIResponse } from '../../../../global/types';
import * as regencyService from '../../../../services/prisma/location/regency';

const getRegency = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await regencyService.getRegency(req);
    res
      .status(StatusCodes.OK)
      .json(
        new SuccessAPIResponse('Getting regencies data successfully', result)
      );
  } catch (error: any) {
    next(error)
  }
};

export { getRegency };
