import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { SuccessAPIResponse } from '../../../../global/types';
import * as profileService from '../../../../services/prisma/customer/profile';
import * as DTO from '../../../../services/prisma/customer/profile/types';

const getCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result =
      await profileService.getCustomerProfile(req) as DTO.CustomerProfileResponse;

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Get profile data successfully', result));
  } catch (error: any) {
    next(error);
  }
};

const updateCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result =
      await profileService.updateCustomerProfile(req) as DTO.CustomerProfileResponse['id'];

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Update profile successfully.', {
        userId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const updateCustomerJoinBotramMethod = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result =
      await profileService.updateCustomerJoinBotramMethod(req) as DTO.CustomerProfileResponse['id'];

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Update join botram method successfully.', {
        userId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

export {
  getCustomerProfile,
  updateCustomerProfile,
  updateCustomerJoinBotramMethod,
};
