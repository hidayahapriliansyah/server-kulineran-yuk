import { Request, Response, NextFunction, json } from 'express';
import { StatusCodes } from 'http-status-codes';

import { SuccessAPIResponse } from '../../../../global/types';
import { createCookieCustomerAccessToken, createCookieRestoAccessToken } from '../../../../utils/createCookie';

import * as authService from '../../../../services/mongoose/customer/auth/index';
import { ICustomer } from '../../../../models/Customer';

const signupForm = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.signupForm(req) as ICustomer['_id'];
    res
      .status(StatusCodes.CREATED)
      .json(new SuccessAPIResponse('Signup successfully', {
        userId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const signinForm = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.signinForm(req) as ICustomer;
    createCookieCustomerAccessToken(res, result);
    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Signin successfully', {
        userId: result._id as ICustomer['_id'],
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
    const user = req.user as ICustomer;
    createCookieCustomerAccessToken(res, user);
    res.status(StatusCodes.OK).json(new SuccessAPIResponse('Signin Successfully', {
      userId: user._id,
    }));
  } catch (error) {
    next(error);
  }
}

export { 
  signupForm,
  signinForm,
  signInUpOAuth,
};
