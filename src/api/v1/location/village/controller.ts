import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getVillage } from '../../../../services/mongoose/location/village';
import { SuccessAPIResponse } from '../../../../global/types';

const getVillageController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await getVillage(req);
    res
      .status(StatusCodes.OK)
      .json(
        new SuccessAPIResponse('Getting district data successfully', result)
      );
  } catch (error: any) {
    next(error)
  }
};

export { getVillageController };
