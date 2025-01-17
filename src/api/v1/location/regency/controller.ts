import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getRegency } from '../../../../services/mongoose/location/regency';
import { SuccessAPIResponse } from '../../../../global/types';

const getRegencyController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await getRegency(req);
    res
      .status(StatusCodes.OK)
      .json(
        new SuccessAPIResponse('Getting regencies data successfully', result)
      );
  } catch (error: any) {
    next(error)
  }
};

export { getRegencyController };
