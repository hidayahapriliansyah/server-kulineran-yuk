import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SuccessAPIResponse } from '../../../../global/types';
import { getDistrict } from '../../../../services/mongoose/location/district';

const index = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await getDistrict(req);
    res
      .status(StatusCodes.OK)
      .json(
        new SuccessAPIResponse('Getting district data successfully', result)
      );
  } catch (error: any) {
    next(error);
  }
};

export { index };
