import { Request, Response, NextFunction } from 'express';
import { getAllProvinces } from '../../services/mongoose/location/province';
import { StatusCodes } from 'http-status-codes';
import { SuccessAPIResponse } from '../../global/types';

const getProvinceController = async (
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

export { getProvinceController };
