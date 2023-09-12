import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import * as authService from '../../../../services/prisma/resto/auth';
import { SuccessAPIResponse } from '../../../../global/types';
import { createCookieRestoAccessToken } from '../../../../utils/createCookie';
import { Restaurant } from '@prisma/client';
import { createIDToken, createJWTPayloadDataRestoIDToken } from '../../../../utils';
import { createJWTPayloadDataRestoRefreshToken } from '../../../../utils/createJwtPayloadData';
import { createRefreshToken } from '../../../../utils/jwt';

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

    const restoIdToken = createIDToken({
      payload: createJWTPayloadDataRestoIDToken(user),
      userType: 'resto',
    });

    const restoRefreshToken = createRefreshToken({
      payload: createJWTPayloadDataRestoRefreshToken(user),
      userType: 'resto',
    });

    res.status(StatusCodes.OK).json(new SuccessAPIResponse('Signin Successfully', {
      userId: restoIdToken,
      token: restoRefreshToken,
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

    const restoIdToken = createIDToken({
      payload: createJWTPayloadDataRestoIDToken(result),
      userType: 'resto',
    });

    const restoRefreshToken = createRefreshToken({
      payload: createJWTPayloadDataRestoRefreshToken(result),
      userType: 'resto',
    });

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Signin successfully', {
        userId: restoIdToken,
        token: restoIdToken,
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
