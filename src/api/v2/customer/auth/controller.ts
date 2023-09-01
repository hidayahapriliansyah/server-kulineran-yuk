import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { Customer } from '@prisma/client';
import { SuccessAPIResponse } from '../../../../global/types';
import {
  createCookieCustomerAccessToken,
  createCookieCustomerIDToken
} from '../../../../utils/createCookie';
import * as authService from '../../../../services/prisma/customer/auth';

const signupForm = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authService.signupForm(req) as Customer['id'];
    res
      .status(StatusCodes.CREATED)
      .json(new SuccessAPIResponse('Signup successfully', {
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
    createCookieCustomerIDToken(res, user);
    res.status(StatusCodes.OK).json(new SuccessAPIResponse('Signin Successfully', {
      userId: user.id,
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
    createCookieCustomerIDToken(res, result);
    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Signin successfully', {
        userId: result.id as Customer['id'],
      }));
  } catch (error: any) {
    next(error);
  }
};

export {
  signupForm,
  signInUpOAuth,
  signinForm,
};
