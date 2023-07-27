import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getAllProvinces } from '../../../../services/mongoose/location/province';
import { SuccessAPIResponse } from '../../../../global/types';

const index = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await getAllProvinces();

    res
      .status(StatusCodes.OK)
      .json(
        new SuccessAPIResponse('Getting provinces data successfully', result)
      );
  } catch (error: any) {
    next(error)
  }
};

export { index };
