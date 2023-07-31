import { Request, Response, NextFunction } from 'express';
import { SuccessAPIResponse } from '../../global/types';
import { StatusCodes } from 'http-status-codes';
import { getProfile } from '../../services/mongoose/resto/profile';
import { IRestaurant } from '../../models/Restaurant';

const getProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await getProfile(req);

    res
      .status(StatusCodes.CREATED)
      .json(new SuccessAPIResponse('Get restaurant profile data successfully', {
        data: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

export {
  getProfileController,
};