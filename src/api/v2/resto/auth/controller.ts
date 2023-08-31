import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import * as authService from '../../../../services/prisma/resto/auth';
import { SuccessAPIResponse } from '../../../../global/types';
import { createCookieRestoAccessToken } from '../../../../utils/createCookie';
import { Restaurant } from '@prisma/client';

const signupForm = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.signupForm(req);

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
    const user = req.user as Restaurant;
    createCookieRestoAccessToken(res, user);
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
    const result = await authService.signinForm(req) as Restaurant;
    createCookieRestoAccessToken(res, result);
    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Signin successfully', {
        userId: result.id as Restaurant['id'],
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
