import { Request, Response, NextFunction } from 'express';
import { SuccessAPIResponse } from '../../../../global/types';
import { StatusCodes } from 'http-status-codes';
import { getProfile, setupProfile, updateProfile } from '../../../../services/mongoose/resto/profile';

const getProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await getProfile(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Get restaurant profile data successfully', {
        data: {
          userId: result,
        },
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
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Update restaurant profile data successfully', {
        data: {
          userId: result,
        },
      }));
  } catch (error: any) {
    next(error);
  }
};

const setupProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await setupProfile(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Update restaurant profile data successfully', {
        data: {
          userId: result,
        },
      }));
  } catch (error: any) {
    next(error);
  }
};

export {
  getProfileController,
  updateProfileController,
  setupProfileController,
};