import { Request, Response, NextFunction, json } from 'express';
import { StatusCodes } from 'http-status-codes';

import { signinForm, signupForm } from '../../../../services/mongoose/resto/auth';
import { SuccessAPIResponse } from '../../../../global/types';
import { IRestaurant } from '../../../../models/Restaurant';
import { createCookieRestoAccessToken } from '../../../../utils/createCookie';

const signupFormController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await signupForm(req) as IRestaurant['_id'];
    res
      .status(StatusCodes.CREATED)
      .json(new SuccessAPIResponse('Signup successfully', {
        userId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const signinFormController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await signinForm(req) as IRestaurant;
    createCookieRestoAccessToken(res, result);
    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Signin successfully', {
        userId: result._id as IRestaurant['_id'],
      }));
  } catch (error: any) {
    next(error);
  }
};

const signInUpOAuthController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as IRestaurant;
    createCookieRestoAccessToken(res, user);
    res.status(StatusCodes.OK).json(new SuccessAPIResponse('Signin Successfully', {
      userId: user._id,
    }));
  } catch (error) {
    next(error);
  }
}

export { 
  signupFormController,
  signinFormController,
  signInUpOAuthController,
};
