import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SuccessAPIResponse } from '../../../../global/types';
import * as provinceService from '../../../../services/prisma/location/province';

const getProvinceController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await provinceService.getAllProvinces();

    res
      .status(StatusCodes.OK)
      .json(
        new SuccessAPIResponse('Getting provinces data successfully.', result)
      );
  } catch (error: any) {
    next(error)
  }
};

export { getProvinceController };
