import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SuccessAPIResponse } from '../../../../global/types';
import { getVillage } from '../../../../services/mongoose/location/village';
import Village from '../../../../models/Village';

const index = async (
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

export { index };
