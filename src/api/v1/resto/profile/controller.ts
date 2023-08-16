import { Request, Response, NextFunction } from 'express';
import { SuccessAPIResponse } from '../../../../global/types';
import { StatusCodes } from 'http-status-codes';
import {
  getProfile,
  setupProfile,
  updateCustomerPaymentType,
  updateProfile 
} from '../../../../services/mongoose/resto/profile';

import * as DTO from '../../../../services/mongoose/resto/profile/types';

const getProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await getProfile(req) as DTO.ProfileResponse;

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Get restaurant profile data successfully', result ));
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
      .json(new SuccessAPIResponse('Update restaurant profile data successfully', { userId: result }));
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
      .json(new SuccessAPIResponse('Update restaurant profile data successfully', { userId: result }));
  } catch (error: any) {
    next(error);
  }
};

const updateCustomerPaymentTypeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await updateCustomerPaymentType(req);

    res
      .status(StatusCodes.OK)
      .json(
        new SuccessAPIResponse(
          'Update restaurant customer payment type successfully', 
          { userId: result }
        )
      );
  } catch (error: any) {
    next(error);
  }
};

export {
  getProfileController,
  updateProfileController,
  setupProfileController,
  updateCustomerPaymentTypeController,
};