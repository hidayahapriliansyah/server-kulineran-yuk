import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { Customer } from '@prisma/client';
import { SuccessAPIResponse } from '../../../../global/types';
import {
  createCookieCustomerAccessToken,
} from '../../../../utils/createCookie';
import * as authService from '../../../../services/prisma/customer/auth';
import { createIDToken, createJWTPayloadDataCustomerIDToken } from '../../../../utils';
import { createRefreshToken } from '../../../../utils/jwt';
import { createJWTPayloadDataCustomerRefreshToken } from '../../../../utils/createJwtPayloadData';
import config from '../../../../config';

const signupForm = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authService.signupForm(req) as Customer['id'];
    res
      .status(StatusCodes.CREATED)
      .json(new SuccessAPIResponse('Signup successfully.', {
        userId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const signInUpOAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as Customer;

    createCookieCustomerAccessToken(res, user);

    const customerIdToken = createIDToken({
      payload: createJWTPayloadDataCustomerIDToken(user),
      userType: 'resto',
    });

    const customerRefreshToken = createRefreshToken({
      payload: createJWTPayloadDataCustomerRefreshToken(user),
      userType: 'resto',
    });
    res.status(StatusCodes.OK).json(new SuccessAPIResponse('Signin Successfully', {
      userId: customerIdToken,
      token: customerRefreshToken,
    }));
  } catch (error) {
    next(error);
  }
};

const signinForm = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.signinForm(req) as Customer;

    createCookieCustomerAccessToken(res, result);

    const customerIdToken = createIDToken({
      payload: createJWTPayloadDataCustomerIDToken(result),
      userType: 'resto',
    });

    const customerRefreshToken = createRefreshToken({
      payload: createJWTPayloadDataCustomerRefreshToken(result),
      userType: 'resto',
    });
    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Signin successfully', {
        userId: customerIdToken,
        token: customerRefreshToken,
      }));
  } catch (error: any) {
    next(error);
  }
};

const signOut = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.clearCookie(config.customerAccessTokenCookieName);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Sign out successfully.'));
  } catch (error: any) {
    next(error);
  }
};

export {
  signupForm,
  signInUpOAuth,
  signinForm,
  signOut,
};
