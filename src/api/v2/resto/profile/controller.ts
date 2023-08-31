import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import * as profileService from '../../../../services/prisma/resto/profile';
import * as DTO from '../../../../services/prisma/resto/profile/types';
import { SuccessAPIResponse } from '../../../../global/types';
import { Restaurant } from '@prisma/client';

const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await profileService.getProfile(req) as DTO.ProfileResponse;

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Get restaurant profile data successfully', result ));
  } catch (error: any) {
    next(error);
  }
};

const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await profileService.updateProfile(req) as Restaurant['id'];

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Update restaurant profile data successfully', { userId: result }));
  } catch (error: any) {
    next(error);
  }
};

const setupProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await profileService.setupProfile(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Update restaurant profile data successfully', { userId: result }));
  } catch (error: any) {
    next(error);
  }
};

const updateCustomerPaymentType = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await profileService.updateCustomerPaymentType(req);

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
  getProfile,
  updateProfile,
  setupProfile,
  updateCustomerPaymentType,
};
