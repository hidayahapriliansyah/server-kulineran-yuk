import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SuccessAPIResponse } from '../../../../global/types';
import * as districtService from '../../../../services/prisma/location/district';

const getDistrictController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await districtService.getDistrict(req);
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
