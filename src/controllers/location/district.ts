import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getDistrict } from '../../services/mongoose/location/district';
import { SuccessAPIResponse } from '../../global/types';

const getDistrictController = async (
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

export { getDistrictController };
