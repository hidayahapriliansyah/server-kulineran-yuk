import { Request, Response, NextFunction } from 'express';
import { SuccessAPIResponse } from '../../global/types';
import { StatusCodes } from 'http-status-codes';
import { getProfile, updateProfile } from '../../services/mongoose/resto/profile';
import { IRestaurant } from '../../models/Restaurant';
import { string, z } from 'zod';

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

const updateProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await updateProfile(req);

    res
      .status(StatusCodes.CREATED)
      .json(new SuccessAPIResponse('Update restaurant profile data successfully', {
        data: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

export {
  getProfileController,
  updateProfileController,
};